#!/usr/bin/env node
/**
 * Copy WASM and font assets to dist folder.
 *
 * This script copies PDFium WASM files and font files from src/pdfium
 * to dist/pdfium for distribution.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(__dirname);
const srcPdfiumDir = path.join(rootDir, 'src', 'pdfium');
const distPdfiumDir = path.join(rootDir, 'dist', 'pdfium');

/**
 * Copy all files from a source directory to a destination directory.
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 */
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    console.log(`Source directory not found: ${srcDir}`);
    return;
  }

  const files = fs.readdirSync(srcDir);
  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${path.relative(rootDir, srcPath)} -> ${path.relative(rootDir, destPath)}`);
    }
  }
}

// Copy fonts and WASM files
copyDir(path.join(srcPdfiumDir, 'fonts'), path.join(distPdfiumDir, 'fonts'));
copyDir(path.join(srcPdfiumDir, 'wasm'), path.join(distPdfiumDir, 'wasm'));

console.log('Assets copied successfully.');
