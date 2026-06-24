// Standalone verification for the ng-add schematic, run with tsx (see the
// `test:schematics` script). It scaffolds a real Angular workspace + app via the
// official @schematics/angular generators, runs ng-add against it, and asserts
// the providers, the ordered SCSS layers, the material-preset dependency, and
// idempotency. Kept out of the jest projects (which use the Angular jsdom
// preset) since schematics are plain node code; tsx handles the CJS/TS interop.
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const COLLECTION = resolve(dirname(fileURLToPath(import.meta.url)), '../collection.json');
const runner = new SchematicTestRunner('rhombuskit', COLLECTION);

async function appTree(): Promise<UnitTestTree> {
  let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    version: '21.0.0',
    newProjectRoot: 'projects',
  });
  tree = await runner.runExternalSchematic(
    '@schematics/angular',
    'application',
    { name: 'app', style: 'scss' },
    tree,
  );
  return tree;
}

async function main(): Promise<void> {
  let tree = await runner.runSchematic('ng-add', { project: 'app' }, await appTree());

  const config = tree.readContent('/projects/app/src/app/app.config.ts');
  assert.match(config, /provideRhombusTheme/, 'app.config.ts should gain provideRhombusTheme');
  assert.match(config, /provideRhombusIcons/, 'app.config.ts should gain provideRhombusIcons');

  const styles = tree.readContent('/projects/app/src/styles.scss');
  assert.ok(styles.includes("@use '@rhombuskit/core/scss';"), 'styles.scss should @use core');
  assert.ok(
    styles.indexOf('@rhombuskit/tokens/scss') < styles.indexOf('@rhombuskit/material-preset/scss'),
    'tokens must precede material-preset',
  );
  assert.ok(
    styles.indexOf('@rhombuskit/material-preset/scss') < styles.indexOf('@rhombuskit/core/scss'),
    'material-preset must precede core',
  );

  const pkg = JSON.parse(tree.readContent('/package.json'));
  assert.ok(pkg.dependencies['@rhombuskit/material-preset'], 'material-preset added to dependencies');

  // Idempotent: a second run must not duplicate the SCSS layers.
  tree = await runner.runSchematic('ng-add', { project: 'app' }, tree);
  const again = tree.readContent('/projects/app/src/styles.scss');
  assert.equal(
    again.match(/@rhombuskit\/core\/scss/g)?.length,
    1,
    'ng-add should be idempotent',
  );

  console.log('✓ ng-add: providers + ordered SCSS layers + material-preset dep, idempotent');
}

main().catch((error) => {
  console.error('✗ ng-add verification failed:\n', error);
  process.exit(1);
});
