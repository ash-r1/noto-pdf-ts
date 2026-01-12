import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    lite: 'src/lite.ts',
    'fonts/noto-cjk': 'src/fonts/noto-cjk.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: ['canvas', 'pdfjs-dist', 'pdf-lib', 'sharp'],
});
