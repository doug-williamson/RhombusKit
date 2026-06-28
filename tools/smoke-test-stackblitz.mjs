#!/usr/bin/env node
// "Open in StackBlitz" build gate. The starter project shipped to StackBlitz —
// app.component.ts, main.ts, styles.scss, package.json, angular.json, the
// tsconfigs — lives as string literals in
// apps/showcase/src/app/shared/stackblitz-starter.ts and is compiled by NOTHING
// in this repo. So a typo, a removed/renamed @rhombuskit export, a bad button
// `variant`, or a broken SCSS `@use` order only fails when a user actually opens
// the StackBlitz link. This gate reconstructs that exact project and runs a real
// `ng build` so a PR can't merge a starter that doesn't compile.
//
// Run via tsx (`pnpm test:stackblitz`) because it imports the .ts source of the
// starter — using the exported object, not a copy, so the gate builds EXACTLY
// what ships (no drift). Mirrors smoke-test-pack.mjs:
//   - We `pnpm pack` the four @rhombuskit deps and wire them in as `file:`
//     tarballs, so the starter builds against THIS PR's packages, not whatever
//     is published to npm (publish always lags the PR). Requires their dist/ to
//     exist first (the CI job builds them before running this).
//   - All four are listed at the starter's top level, so npm resolves each
//     package's intra-monorepo @rhombuskit/* runtime deps (rewritten by pnpm
//     pack from workspace:* to the concrete lockstep version, which is not on the
//     registry) to those same top-level file: installs.
//   - @angular/* (deps AND devDeps: build/cli/compiler-cli) are pinned to the
//     monorepo's exact versions — the declared ^21 ranges otherwise float to the
//     newest patch and, under a strict resolver, collide (ERESOLVE).
//
// process.exit(1) + console.error on failure, like the other smoke gates.

import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PNPM = process.env.SMOKE_PNPM || 'pnpm';

const ROOT_DEV = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8')).devDependencies || {};
const NG_VERSION = ROOT_DEV['@angular/core'];

// The @rhombuskit packages the Angular starter depends on, in build order.
const RK_PACKAGES = [
  { dir: 'tokens', name: '@rhombuskit/tokens' },
  { dir: 'theme-engine', name: '@rhombuskit/theme-engine' },
  { dir: 'material-preset', name: '@rhombuskit/material-preset' },
  { dir: 'core', name: '@rhombuskit/core' },
];

function die(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function sh(command, opts = {}) {
  return execSync(command, { stdio: 'pipe', encoding: 'utf8', ...opts });
}

/** name -> tarball filename, e.g. @rhombuskit/core -> rhombuskit-core-1.7.2.tgz */
function tarballName(name, version) {
  return `${name.replace('@', '').replace('/', '-')}-${version}.tgz`;
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
  // 1. Load the EXACT starter that ships to users. Its only import is
  //    `import type` (erased), so importing pulls just the file map.
  const starterUrl = pathToFileURL(
    join(REPO_ROOT, 'apps/showcase/src/app/shared/stackblitz-starter.ts'),
  ).href;
  const { STACKBLITZ_STARTER } = await import(starterUrl);
  const files = STACKBLITZ_STARTER?.files;
  if (!files || typeof files !== 'object') {
    die('could not load STACKBLITZ_STARTER.files from stackblitz-starter.ts');
  }

  // 2. Pack the four @rhombuskit deps so the build resolves against this PR.
  const staging = mkdtempSync(join(tmpdir(), 'rk-sb-pack-'));
  tempDirs.push(staging);
  const tarballs = {}; // name -> abs tarball path

  console.log('Packing @rhombuskit packages (honors publishConfig.directory)...');
  for (const pkg of RK_PACKAGES) {
    const pkgDir = join(REPO_ROOT, 'packages', pkg.dir);
    const src = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
    sh(`${PNPM} pack --pack-destination "${staging}"`, { cwd: pkgDir });
    const tarballPath = join(staging, tarballName(src.name, src.version));
    if (!existsSync(tarballPath)) {
      die(`${pkg.name}: expected tarball not found at ${tarballPath} (was the package built?)`);
    }
    tarballs[pkg.name] = tarballPath;
    console.log(`  ✓ packed ${src.name}@${src.version}`);
  }

  // 3. Materialize the starter project on disk.
  const proj = mkdtempSync(join(tmpdir(), 'rk-sb-build-'));
  tempDirs.push(proj);
  for (const [relPath, content] of Object.entries(files)) {
    const dest = join(proj, relPath);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, content);
  }

  // 4. Rewire deps: @rhombuskit/* -> local tarballs; @angular/* -> monorepo pins.
  const pkgJsonPath = join(proj, 'package.json');
  const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  for (const field of ['dependencies', 'devDependencies']) {
    const deps = pkgJson[field];
    if (!deps) continue;
    for (const dep of Object.keys(deps)) {
      if (dep.startsWith('@rhombuskit/')) {
        if (!tarballs[dep]) die(`starter depends on ${dep}, which this gate does not pack`);
        deps[dep] = `file:${tarballs[dep].replace(/\\/g, '/')}`;
      } else if (dep.startsWith('@angular/')) {
        deps[dep] = ROOT_DEV[dep] || NG_VERSION; // exact monorepo pin (no float -> no ERESOLVE)
      }
      // rxjs / tslib / zone.js / typescript: keep the starter's declared ranges.
    }
  }
  writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2));

  // 5. Install + build exactly as StackBlitz would.
  console.log('\nInstalling the starter (local @rhombuskit tarballs + pinned Angular)...');
  // --legacy-peer-deps: Angular's tight exact-version internal peers
  // (material/cdk) don't cleanly resolve in an isolated dir under strict npm;
  // legacy mode installs a working tree regardless. The build itself is the gate.
  sh('npm install --no-audit --no-fund --no-package-lock --legacy-peer-deps --loglevel=error', {
    cwd: proj,
    stdio: 'inherit',
  });

  const ngBin = join(proj, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
  if (!existsSync(ngBin)) die('@angular/cli was not installed into the starter');

  console.log('\nBuilding the starter (ng build)...');
  // ng build runs the Angular linker over the partial-Ivy @rhombuskit libs and
  // compiles the inline template under strictTemplates:true — so this catches
  // template, API/export, and SCSS @use errors, not just a bare import.
  sh(`node "${ngBin}" build`, { cwd: proj, stdio: 'inherit' });

  const dist = join(proj, 'dist');
  if (!existsSync(dist) || readdirSync(dist).length === 0) {
    die('ng build reported success but produced no dist/ output');
  }

  console.log('\n✓ StackBlitz starter gate passed: the embedded project installs and builds.');
} catch (err) {
  console.error(`✗ StackBlitz starter gate failed: ${err?.message ?? err}`);
  process.exitCode = 1;
} finally {
  cleanup();
}
