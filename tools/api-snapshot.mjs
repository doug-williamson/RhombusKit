#!/usr/bin/env node
// Public-API surface snapshot guard (Phase 5).
//
// Reads each published package's built .d.ts entry, extracts the public export
// surface (exported symbols + their public members/signatures, privates and
// Angular ɵ-internals filtered) via the TypeScript compiler API, and renders a
// stable Markdown report per package under etc/.
//
//   node tools/api-snapshot.mjs            # check: fail on drift vs committed reports
//   node tools/api-snapshot.mjs --update   # regenerate the committed reports
//
// Robust across ng-packagr (.d.ts) and tsup (.d.mts) outputs — it analyses the
// declaration rollup only, never the source (so optional-peer dynamic imports
// and the like can't crash it). Run after `nx run-many --target=build --all`.
import ts from 'typescript';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const PACKAGES = [
  {
    name: '@rhombuskit/core',
    entry: 'dist/packages/core/types/rhombuskit-core.d.ts',
    report: 'etc/core.api.md',
  },
  {
    name: '@rhombuskit/theme-engine',
    entry: 'dist/packages/theme-engine/types/rhombuskit-theme-engine.d.ts',
    report: 'etc/theme-engine.api.md',
  },
  {
    name: '@rhombuskit/tokens',
    entry: 'packages/tokens/dist/index.d.mts',
    report: 'etc/tokens.api.md',
  },
];

const COMPILER_OPTIONS = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: false,
  lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
  types: [],
};

const TYPE_FLAGS = ts.TypeFormatFlags.NoTruncation;

function isHidden(decl) {
  const flags = ts.getCombinedModifierFlags(decl);
  return Boolean(flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected));
}

function memberLine(checker, prop) {
  const decl = prop.valueDeclaration ?? prop.declarations?.[0];
  if (!decl) return null;
  const name = prop.getName();
  if (name.startsWith('ɵ') || name === 'constructor') return null;
  if (isHidden(decl)) return null;
  const flags = ts.getCombinedModifierFlags(decl);
  const readonly = flags & ts.ModifierFlags.Readonly ? 'readonly ' : '';
  const optional = prop.flags & ts.SymbolFlags.Optional ? '?' : '';
  const type = checker.getTypeOfSymbolAtLocation(prop, decl);
  return `  ${readonly}${name}${optional}: ${checker.typeToString(type, decl, TYPE_FLAGS)}`;
}

function membersBlock(checker, type) {
  const lines = type
    .getProperties()
    .map((p) => memberLine(checker, p))
    .filter(Boolean)
    .sort();
  return lines.length ? lines.join('\n') : '  // (no public members)';
}

function renderExport(checker, exportSymbol) {
  const name = exportSymbol.getName();
  const sym =
    exportSymbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(exportSymbol)
      : exportSymbol;
  const decl = sym.declarations?.[0];
  if (!decl) return null;

  if (ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl)) {
    const kind = ts.isClassDeclaration(decl) ? 'class' : 'interface';
    const instanceType = checker.getDeclaredTypeOfSymbol(sym);
    return `### ${name} (${kind})\n${membersBlock(checker, instanceType)}`;
  }
  if (ts.isTypeAliasDeclaration(decl)) {
    // typeToString renders a named alias as its own name; use the declaration's
    // RHS text (plus any type parameters) to capture the actual definition.
    const params = decl.typeParameters
      ? `<${decl.typeParameters.map((p) => p.getText()).join(', ')}>`
      : '';
    return `### ${name} (type)\n  type ${name}${params} = ${decl.type.getText()}`;
  }
  if (ts.isEnumDeclaration(decl)) {
    const members = decl.members.map((m) => `  ${m.name.getText()}`).sort();
    return `### ${name} (enum)\n${members.join('\n')}`;
  }
  if (ts.isFunctionDeclaration(decl)) {
    const t = checker.getTypeOfSymbolAtLocation(sym, decl);
    return `### ${name} (function)\n  ${name}: ${checker.typeToString(t, decl, TYPE_FLAGS)}`;
  }
  // const / variable / namespace / other value export
  const t = checker.getTypeOfSymbolAtLocation(sym, decl);
  return `### ${name} (const)\n  ${name}: ${checker.typeToString(t, decl, TYPE_FLAGS)}`;
}

function generate(pkg) {
  const entry = resolve(root, pkg.entry);
  if (!existsSync(entry)) {
    throw new Error(`Entry not found — build first: ${pkg.entry}`);
  }
  const program = ts.createProgram([entry], COMPILER_OPTIONS);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entry);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile) ?? sourceFile.symbol;
  if (!moduleSymbol) throw new Error(`No module symbol for ${pkg.entry}`);

  const blocks = checker
    .getExportsOfModule(moduleSymbol)
    .map((s) => renderExport(checker, s))
    .filter(Boolean)
    .sort();

  return (
    `# API Report — ${pkg.name}\n\n` +
    '> Generated by `tools/api-snapshot.mjs` — do not edit by hand.\n' +
    '> The frozen public export surface. Drift is reviewed under the semver\n' +
    '> policy; regenerate intentionally with `node tools/api-snapshot.mjs --update`.\n\n' +
    blocks.join('\n\n') +
    '\n'
  );
}

const update = process.argv.includes('--update');
mkdirSync(resolve(root, 'etc'), { recursive: true });

let failed = false;
for (const pkg of PACKAGES) {
  const content = generate(pkg);
  const reportPath = resolve(root, pkg.report);
  if (update) {
    writeFileSync(reportPath, content);
    console.log(`✓ wrote ${pkg.report}`);
  } else {
    const existing = existsSync(reportPath) ? readFileSync(reportPath, 'utf8') : '';
    if (existing !== content) {
      failed = true;
      console.error(
        `✗ public API drift in ${pkg.name} — review, then run: node tools/api-snapshot.mjs --update`
      );
    } else {
      console.log(`✓ ${pkg.name} matches ${pkg.report}`);
    }
  }
}

if (failed) process.exit(1);
console.log('✓ API surface matches all committed reports.');
