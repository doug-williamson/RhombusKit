#!/usr/bin/env node
// Smoke-test the built dist (mirrors what a consumer would import).
import { tokens } from '../packages/tokens/dist/index.mjs';

const expected = '#f8fafc';
const actual = tokens.themes['rhombus-light']['--bg'];
if (actual !== expected) {
  console.error(`✗ Expected --bg=${expected}, got ${actual}`);
  process.exit(1);
}
console.log(`✓ tokens.themes['rhombus-light']['--bg'] === ${actual}`);
console.log(`✓ tokens.themes['rhombus-dark']['--bg']  === ${tokens.themes['rhombus-dark']['--bg']}`);
