import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: {
    tsconfig: './tsconfig.json',
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: ['canvas', 'pdfjs-dist', 'pdf-lib', 'sharp'],
});
