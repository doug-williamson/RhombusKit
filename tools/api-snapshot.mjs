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

// --- Showcase API metadata (feeds the component-page API tab) ----------------
// Reuses the same .d.ts extraction to emit a typed metadata module the showcase
// renders as API tables — one toolchain, two outputs. The markdown reports above
// are untouched (byte-identical); this module is guarded the same way.
const SHOWCASE_METADATA = 'apps/showcase/src/generated/api-metadata.ts';
const SHOWCASE_SOURCE = PACKAGES[0]; // @rhombuskit/core — holds every page's apiKey.

function docText(checker, sym) {
  return ts.displayPartsToString(sym.getDocumentationComment(checker)).trim();
}

function firstTypeArg(checker, type) {
  let args = [];
  try {
    args = checker.getTypeArguments(type) ?? [];
  } catch {
    args = type.typeArguments ?? [];
  }
  return args.length ? checker.typeToString(args[0], undefined, TYPE_FLAGS) : '';
}

// Reduce a printed type to the bare exported name(s) it references, so an input
// typed `RadioOption<T>[]` or `ColumnDef<T> | null` resolves to `RadioOption` /
// `ColumnDef` for type-table expansion.
function referencedTypeNames(typeStr) {
  return typeStr
    .replace(/\breadonly\b/g, '')
    .split(/[|&,()]/) // split unions/intersections/tuples
    .map((part) => {
      let s = part.trim().replace(/\[\]$/, '').trim();
      const lt = s.indexOf('<');
      if (lt >= 0) s = s.slice(0, lt);
      return s.split('.').pop()?.trim() ?? '';
    })
    .filter((n) => /^[A-Z]\w+$/.test(n));
}

// Split the `<...>` type arguments of a single ɵɵ*Declaration at top level, so
// positional args (selector, inputs map, ngContentSelectors) can be read out.
function splitTypeArgs(decl) {
  const lt = decl.indexOf('<');
  const inner = decl.slice(lt + 1, decl.lastIndexOf('>'));
  const args = [];
  let depth = 0;
  let cur = '';
  for (const c of inner) {
    if (c === '<' || c === '{' || c === '[' || c === '(') depth++;
    else if (c === '>' || c === '}' || c === ']' || c === ')') depth--;
    if (c === ',' && depth === 0) {
      args.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  if (cur.trim()) args.push(cur.trim());
  return args;
}

// Parse the ɵcmp/ɵdir declarations from the rollup text into per-class metadata:
// the selector, the input alias/required map, and the content-projection
// selectors (ngContentSelectors). Angular's declaration types carry the binding
// aliases and required flags that the instance-type surface alone does not.
function parseDeclarations(text) {
  const out = {};
  const re = /ɵɵ(?:Component|Directive)Declaration</g;
  let m;
  while ((m = re.exec(text))) {
    // Walk to the matching top-level `>` from this declaration's `<`.
    let depth = 0;
    let end = m.index;
    for (let i = text.indexOf('<', m.index); i < text.length; i++) {
      const c = text[i];
      if (c === '<') depth++;
      else if (c === '>' && --depth === 0) {
        end = i;
        break;
      }
    }
    const body = text.slice(m.index, end + 1);
    const args = splitTypeArgs(body);
    const className = args[0]?.trim();
    if (!className) continue;

    const selRaw = args[1]?.trim() ?? 'never';
    const selector = selRaw.startsWith('"') ? selRaw.slice(1, -1) : null;

    const inputs = {};
    const ire = /"([^"]+)":\s*\{\s*"alias":\s*"([^"]*)";\s*"required":\s*(true|false)/g;
    let im;
    while ((im = ire.exec(args[3] ?? ''))) {
      inputs[im[1]] = { alias: im[2], required: im[3] === 'true' };
    }

    // ngContentSelectors is the 7th type arg (index 6); `never` for directives.
    let slots = [];
    const ng = args[6]?.trim();
    if (ng && ng.startsWith('[')) {
      try {
        slots = JSON.parse(ng.replace(/'/g, '"'));
      } catch {
        slots = [];
      }
    }
    out[className] = { selector, inputs, slots };
  }
  return out;
}

// Registry of exported types referenced by component APIs: string-literal unions
// (surfaced inline as enum values) and interfaces / ref-unions (surfaced as
// expandable field tables). Built from the same .d.ts the entries come from.
function buildTypeRegistry(checker, moduleSymbol) {
  const registry = {};
  for (const exp of checker.getExportsOfModule(moduleSymbol)) {
    const sym =
      exp.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exp) : exp;
    const decl = sym.declarations?.[0];
    if (!decl) continue;
    const name = exp.getName();

    if (ts.isInterfaceDeclaration(decl)) {
      registry[name] = {
        kind: 'interface',
        members: interfaceMembers(checker, sym, decl),
      };
    } else if (ts.isTypeAliasDeclaration(decl) && ts.isUnionTypeNode(decl.type)) {
      const parts = decl.type.types;
      const literals = parts.filter(
        (t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)
      );
      if (literals.length === parts.length) {
        registry[name] = { kind: 'union', values: literals.map((t) => t.literal.text) };
      } else {
        const refs = parts
          .filter(ts.isTypeReferenceNode)
          .map((t) => t.typeName.getText());
        if (refs.length) registry[name] = { kind: 'refs', refs };
      }
    }
  }
  return registry;
}

function interfaceMembers(checker, sym) {
  const type = checker.getDeclaredTypeOfSymbol(sym);
  return type
    .getProperties()
    .map((p) => {
      const d = p.valueDeclaration ?? p.declarations?.[0];
      if (!d || p.getName().startsWith('ɵ')) return null;
      const pt = checker.getTypeOfSymbolAtLocation(p, d);
      const member = {
        name: p.getName(),
        type: checker.typeToString(pt, d, TYPE_FLAGS),
        description: docText(checker, p),
      };
      if (!(p.flags & ts.SymbolFlags.Optional)) member.required = true;
      return member;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Classify a public member as an Angular input / output / method, unwrapping the
// signal wrapper so the table shows the value type (e.g. InputSignal<ButtonVariant>
// → ButtonVariant). Computed/internal signals and plain props are dropped.
// `inputMeta` (from the ɵ-declaration) supplies the binding alias + required flag;
// `unions` enumerates string-literal union members inline.
function classifyMember(checker, prop, inputMeta, unions) {
  const decl = prop.valueDeclaration ?? prop.declarations?.[0];
  if (!decl) return null;
  const propName = prop.getName();
  if (propName.startsWith('ɵ') || propName === 'constructor') return null;
  if (isHidden(decl)) return null;
  const type = checker.getTypeOfSymbolAtLocation(prop, decl);
  const typeStr = checker.typeToString(type, decl, TYPE_FLAGS);
  const description = docText(checker, prop);

  if (/(?:^|\.)(InputSignal|InputSignalWithTransform|ModelSignal)</.test(typeStr)) {
    const meta = inputMeta?.[propName];
    const valueType = firstTypeArg(checker, type) || typeStr;
    // Show the binding alias consumers actually type, not the internal property
    // name (e.g. `rhombusTooltip`, not `message`).
    const member = { name: meta?.alias ?? propName, type: valueType, description };
    if (meta?.required) member.required = true;
    const union = unions[referencedTypeNames(valueType)[0]];
    if (union?.kind === 'union') member.enumValues = union.values;
    return { group: 'inputs', member };
  }
  if (/(?:^|\.)(OutputEmitterRef|OutputRef|EventEmitter)</.test(typeStr)) {
    return {
      group: 'outputs',
      member: { name: propName, type: firstTypeArg(checker, type) || typeStr, description },
    };
  }
  if (/(?:^|\.)(Writable)?Signal</.test(typeStr)) return null; // computed/internal
  const isMethod =
    ts.isMethodDeclaration(decl) ||
    ts.isMethodSignature(decl) ||
    type.getCallSignatures().length > 0;
  if (isMethod) return { group: 'methods', member: { name: propName, type: typeStr, description } };
  return null;
}

function extractEntry(checker, exportSymbol, decls, registry) {
  const name = exportSymbol.getName();
  const sym =
    exportSymbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(exportSymbol)
      : exportSymbol;
  const decl = sym.declarations?.[0];
  if (!decl || !ts.isClassDeclaration(decl)) return null; // components/directives/services

  const className = decl.name?.getText() ?? name;
  const meta = decls[className];
  const instanceType = checker.getDeclaredTypeOfSymbol(sym);
  const entry = {
    name,
    kind: 'class',
    selector: meta?.selector ?? null,
    description: docText(checker, sym),
    inputs: [],
    outputs: [],
    methods: [],
  };
  for (const prop of instanceType.getProperties()) {
    const c = classifyMember(checker, prop, meta?.inputs, registry);
    if (c) entry[c.group].push(c.member);
  }

  // Content-projection slots from the declaration's ngContentSelectors.
  if (meta?.slots?.length) entry.slots = meta.slots;

  // Expand referenced exported interfaces (incl. those reached through a
  // ref-union alias like `ColumnDef = DataColumn | DisplayColumn`) into field
  // tables. String-literal unions are surfaced inline (member.enumValues), not
  // here, to avoid duplication.
  const types = [];
  const seen = new Set();
  const addType = (typeName) => {
    if (!typeName || seen.has(typeName)) return;
    seen.add(typeName);
    const r = registry[typeName];
    if (!r) return;
    if (r.kind === 'interface') {
      types.push({ name: typeName, kind: 'interface', members: r.members });
    } else if (r.kind === 'refs') {
      r.refs.forEach((ref) => addType(referencedTypeNames(ref)[0]));
    }
  };
  for (const m of [...entry.inputs, ...entry.outputs]) {
    referencedTypeNames(m.type).forEach(addType);
  }
  if (types.length) entry.types = types;

  return entry;
}

function showcaseMetadata() {
  const entry = resolve(root, SHOWCASE_SOURCE.entry);
  if (!existsSync(entry)) {
    throw new Error(`Entry not found — build first: ${SHOWCASE_SOURCE.entry}`);
  }
  const program = ts.createProgram([entry], COMPILER_OPTIONS);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entry);
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile) ?? sourceFile.symbol;
  const decls = parseDeclarations(sourceFile.getText());
  const registry = buildTypeRegistry(checker, moduleSymbol);

  const entries = {};
  for (const s of checker.getExportsOfModule(moduleSymbol)) {
    const e = extractEntry(checker, s, decls, registry);
    if (e) entries[e.name] = e;
  }
  const sorted = Object.fromEntries(
    Object.keys(entries).sort().map((k) => [k, entries[k]])
  );

  return (
    '// AUTO-GENERATED by tools/api-snapshot.mjs — do not edit by hand.\n' +
    '// Public API metadata for the showcase component-page API tab. Regenerate\n' +
    '// with `node tools/api-snapshot.mjs --update` (after building core).\n\n' +
    'export interface ApiMember {\n  name: string;\n  type: string;\n  description: string;\n' +
    '  required?: boolean;\n  enumValues?: string[];\n}\n\n' +
    'export interface ApiTypeRef {\n  name: string;\n  kind: string;\n  members: ApiMember[];\n}\n\n' +
    'export interface ApiEntry {\n' +
    '  name: string;\n  kind: string;\n  selector: string | null;\n  description: string;\n' +
    '  inputs: ApiMember[];\n  outputs: ApiMember[];\n  methods: ApiMember[];\n' +
    '  slots?: string[];\n  types?: ApiTypeRef[];\n}\n\n' +
    'export const API_METADATA: Record<string, ApiEntry> = ' +
    JSON.stringify(sorted, null, 2) +
    ';\n'
  );
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

// Showcase API metadata — guarded exactly like the reports above.
const showcaseContent = showcaseMetadata();
const showcasePath = resolve(root, SHOWCASE_METADATA);
if (update) {
  mkdirSync(dirname(showcasePath), { recursive: true });
  writeFileSync(showcasePath, showcaseContent);
  console.log(`✓ wrote ${SHOWCASE_METADATA}`);
} else {
  const existing = existsSync(showcasePath) ? readFileSync(showcasePath, 'utf8') : '';
  if (existing !== showcaseContent) {
    failed = true;
    console.error(
      `✗ showcase API metadata drift — run: node tools/api-snapshot.mjs --update`
    );
  } else {
    console.log(`✓ showcase API metadata matches ${SHOWCASE_METADATA}`);
  }
}

if (failed) process.exit(1);
console.log('✓ API surface matches all committed reports.');
