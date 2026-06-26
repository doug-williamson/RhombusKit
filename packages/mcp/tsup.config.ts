import { defineConfig } from 'tsup';

export default defineConfig({
  // index.ts is the programmatic library (createServer + pure helpers); cli.ts is
  // the npx entry that wires the server to stdio. @modelcontextprotocol/sdk and zod
  // stay external (declared deps); the generated data module is bundled in.
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
});
