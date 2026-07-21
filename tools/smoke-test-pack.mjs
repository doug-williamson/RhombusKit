#!/usr/bin/env node
// Publish smoke gate. For each package, pack the publish artifact, install it
// with its declared dependencies into a clean dir, import it, and assert a
// canonical named export — so a broken artifact blocks the release instead of
// reaching consumers. Mirrors the exit/log shape of smoke-test-tokens-ts.mjs
// (process.exit(1) + console.error on failure).
//
// Notes:
//   - We `pnpm pack` (not `dist/` directly) so test == ship: pnpm pack honors
//     publishConfig.directory, packing exactly what `pnpm publish` uploads.
//   - The import asserts the NAMED export, not merely that import didn't throw.
//     Import does not instantiate anything (Angular decorators / inject() and
//     partial-Ivy ngDeclare* run lazily, not at module load), so a bare import
//     in plain node is enough to prove resolvability.
//   - Intra-monorepo runtime deps (@rhombuskit/*) are rewritten by pnpm pack
//     from workspace:* to the concrete current version, which is not on the
//     registry during the gate. So we pack all packages first and wire those
//     deps to the local tarballs (file:) instead of the registry.
//   - For the two ng-packagr libs we additionally assert a partial-Ivy marker
//     (ngDeclare*). Full-mode output imports fine, so the export check alone
//     would not catch an APF (compilationMode) regression.
//   - Core's ./scss check is whole-surface only; per-partial drift is the
//     deferred copy-core-assets.mjs glob concern, not this gate's job.

import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PNPM = process.env.SMOKE_PNPM || 'pnpm';

// Angular's core/common FESM statically import these, but a library only
// declares @angular/* (whose own peers npm does not auto-install). A real
// Angular app consumer always provides them, so the gate does too — pinned to
// the monorepo's versions for fidelity.
const ROOT_DEV = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')).devDependencies || {};
// Pin every @angular/* package to its own monorepo-resolved version (core/common
// at 21.2.x, material/cdk lag at 21.2.y — they are NOT in lockstep). The declared
// peers use ranges (^21) that otherwise float to the newest patch on a fresh
// registry and then conflict with the pinned runtime supplements — float + strict
// npm = ERESOLVE. Exact pins from ROOT_DEV remove the float; NG_VERSION is the
// fallback for any @angular package not in devDependencies.
const NG_VERSION = ROOT_DEV['@angular/core'];
// rxjs/zone.js/tslib: statically imported by @angular/* FESM. @angular/compiler:
// partial-Ivy (ngDeclare*) libraries are linked at the consumer's build; to
// evaluate them in plain node we load the compiler so Angular JIT-links them at
// runtime (the standard node/SSR pattern). All pinned to the monorepo versions.
const ANGULAR_RUNTIME = [
  'rxjs',
  'zone.js',
  'tslib',
  '@angular/compiler', // JIT-links partial-Ivy declarations at runtime
  '@angular/platform-browser', // Material (e.g. icon -> DomSanitizer) imports it
  '@angular/animations', // ambient app runtime some Material entrypoints expect
];

// Publish order: tokens -> theme-engine -> material-preset -> core -> mcp.
// (mcp has no @rhombuskit/* runtime deps, so its position is independent.)
const PACKAGES = [
  {
    dir: 'tokens',
    name: '@rhombuskit/tokens',
    label: 'tokens',
    assert: "if (typeof m.tokens !== 'object' || m.tokens === null) throw new Error('missing named export: tokens');",
  },
  {
    dir: 'theme-engine',
    name: '@rhombuskit/theme-engine',
    label: 'provideRhombusTheme + RhombusThemeService',
    assert:
      "if (typeof m.provideRhombusTheme !== 'function') throw new Error('missing named export: provideRhombusTheme');\n" +
      "if (typeof m.RhombusThemeService !== 'function') throw new Error('missing named export: RhombusThemeService');",
    ivyMarker: 'ngDeclareInjectable',
  },
  {
    dir: 'material-preset',
    name: '@rhombuskit/material-preset',
    label: 'RHOMBUS_MATERIAL_PRESET_VERSION',
    assert:
      "if (typeof m.RHOMBUS_MATERIAL_PRESET_VERSION !== 'string') throw new Error('missing named export: RHOMBUS_MATERIAL_PRESET_VERSION');",
  },
  {
    dir: 'core',
    name: '@rhombuskit/core',
    label: 'RhombusButtonComponent',
    assert:
      "if (typeof m.RhombusButtonComponent !== 'function') throw new Error('missing named export: RhombusButtonComponent');",
    ivyMarker: 'ngDeclareComponent',
    scss: true,
  },
  {
    dir: 'mcp',
    name: '@rhombuskit/mcp',
    label: 'createServer',
    assert:
      "if (typeof m.createServer !== 'function') throw new Error('missing named export: createServer');",
  },
  {
    dir: 'theme-builder',
    name: '@rhombuskit/theme-builder',
    label: 'generateTheme',
    assert:
      "if (typeof m.generateTheme !== 'function') throw new Error('missing named export: generateTheme');",
  },
];

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function sh(command, opts = {}) {
  return execSync(command, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

/** name -> tarball filename, e.g. @rhombuskit/core -> rhombuskit-core-0.2.0.tgz */
function tarballName(name, version) {
  return `${name.replace('@', '').replace('/', '-')}-${version}.tgz`;
}

/**
 * Read package/package.json out of a packed .tgz without extracting to disk.
 * Runs tar with cwd set to the tarball's dir and passes the bare filename so a
 * Windows drive-letter path (C:\...) is not mistaken for a remote host by the
 * MSYS tar that may be first on PATH.
 */
function readPackedManifest(tarballPath) {
  const json = sh(`tar -xzOf "${basename(tarballPath)}" package/package.json`, {
    cwd: dirname(tarballPath),
  });
  return JSON.parse(json);
}

/** True if any JS/ESM bundle file under dir contains needle. */
function anyJsContains(dir, needle) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (anyJsContains(full, needle)) return true;
    } else if (
      (entry.endsWith('.js') || entry.endsWith('.mjs') || entry.endsWith('.cjs')) &&
      readFileSync(full, 'utf8').includes(needle)
    ) {
      return true;
    }
  }
  return false;
}

const tempDirs = [];

function cleanup() {
  for (const dir of tempDirs) {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
    } catch {
      // best-effort; a leftover temp dir is not a gate failure.
    }
  }
}

try {
  // 1. Pack every package up front so @rhombuskit/* deps can resolve locally.
  const staging = mkdtempSync(join(tmpdir(), 'rk-smoke-pack-'));
  tempDirs.push(staging);
  const tarballs = {}; // name -> abs tarball path

  console.log('Packing all packages (honors publishConfig.directory)...');
  for (const pkg of PACKAGES) {
    const pkgDir = join(REPO_ROOT, 'packages', pkg.dir);
    const src = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    sh(`${PNPM} pack --pack-destination "${staging}"`, { cwd: pkgDir });
    const tarballPath = join(staging, tarballName(src.name, src.version));
    if (!existsSync(tarballPath)) {
      die(`${pkg.name}: expected tarball not found at ${tarballPath}`);
    }
    tarballs[src.name] = tarballPath;
    console.log(`  ✓ packed ${src.name}`);
  }

  // 2. Install + import + assert each package in isolation.
  for (const pkg of PACKAGES) {
    console.log(`\n▶ ${pkg.name}`);
    const tarballPath = tarballs[pkg.name];
    const manifest = readPackedManifest(tarballPath);

    const declared = {
      ...(manifest.peerDependencies || {}),
      ...(manifest.dependencies || {}),
    };
    const deps = {};
    for (const [dep, range] of Object.entries(declared)) {
      if (dep.startsWith('@rhombuskit/')) {
        if (!tarballs[dep]) die(`${pkg.name} depends on ${dep} which was not packed`);
        deps[dep] = `file:${tarballs[dep].replace(/\\/g, '/')}`;
      } else if (dep.startsWith('@angular/')) {
        deps[dep] = ROOT_DEV[dep] || NG_VERSION; // pin to monorepo version (no float)
      } else {
        deps[dep] = range; // external: install the declared range from the registry
      }
    }
    // Supply the Angular runtime + compiler that @angular/* packages need to
    // evaluate (and JIT-link partial-Ivy) in plain node.
    const needsAngular = Object.keys(declared).some((d) => d.startsWith('@angular/'));
    if (needsAngular) {
      for (const rt of ANGULAR_RUNTIME) {
        if (deps[rt]) continue;
        const v = ROOT_DEV[rt] || NG_VERSION; // monorepo-pinned (all runtime entries are in devDeps)
        if (v) deps[rt] = v;
      }
    }
    deps[pkg.name] = `file:${tarballPath.replace(/\\/g, '/')}`;

    const proj = mkdtempSync(join(tmpdir(), `rk-smoke-${pkg.dir}-`));
    tempDirs.push(proj);
    writeFileSync(
      join(proj, 'package.json'),
      JSON.stringify({ name: `smoke-${pkg.dir}`, version: '1.0.0', private: true, dependencies: deps }, null, 2),
    );

    console.log('  installing (declared deps from manifest + local tarballs)...');
    // --legacy-peer-deps: the smoke env validates importability, not peer
    // resolution. Angular's tight exact-version internal peers (material/cdk)
    // don't cleanly resolve in an isolated dir under strict npm; legacy mode
    // installs a working tree regardless.
    sh('npm install --no-audit --no-fund --no-package-lock --legacy-peer-deps --loglevel=error', {
      cwd: proj,
    });

    writeFileSync(
      join(proj, 'check.mjs'),
      `${needsAngular ? "import '@angular/compiler';\n" : ''}import * as m from '${pkg.name}';\n${pkg.assert}\nconsole.log('  ✓ import + named export(s): ${pkg.label}');\n`,
    );
    sh('node check.mjs', { cwd: proj, stdio: 'inherit' });

    const installed = join(proj, 'node_modules', ...pkg.name.split('/'));

    if (pkg.ivyMarker) {
      if (!anyJsContains(installed, pkg.ivyMarker)) {
        die(`${pkg.name}: partial-Ivy marker '${pkg.ivyMarker}' not found in the installed bundle (full-mode/APF regression).`);
      }
      console.log(`  ✓ partial-Ivy (${pkg.ivyMarker})`);
    }

    if (pkg.scss) {
      const im = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
      const scssEntry = im.exports?.['./scss']?.sass;
      if (!scssEntry) die(`${pkg.name}: './scss' export missing from installed manifest`);
      if (!existsSync(join(installed, scssEntry))) {
        die(`${pkg.name}: ${scssEntry} (./scss) not found in installed package`);
      }
      const starEntry = im.exports?.['./scss/*']?.sass; // e.g. ./scss/_*.scss
      if (starEntry) {
        const partial = join(installed, starEntry.replace('*', 'badge')); // ./scss/badge -> _badge.scss
        if (!existsSync(partial)) die(`${pkg.name}: ./scss/* partial not resolvable (${partial})`);
      }
      console.log('  ✓ scss (./scss + ./scss/* resolve)');
    }
  }

  console.log('\n✓ smoke gate passed: all packages pack, install, import, and assert.');
} finally {
  cleanup();
}
