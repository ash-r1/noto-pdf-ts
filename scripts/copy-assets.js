#!/usr/bin/env node
/**
 * Copy assets to dist folder.
 *
 * For core package: copies PDFium WASM files from src/pdfium/wasm to dist/pdfium/wasm
 * For font packages: copies font files from fonts/ to dist/fonts/
 *
 * Usage:
 *   node scripts/copy-assets.js core          # For @noto-pdf-ts/core
 *   node scripts/copy-assets.js fonts-jp      # For @noto-pdf-ts/fonts-jp
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(__dirname);

/**
 * Copy all files from a source directory to a destination directory.
 * @param {string} srcDir - Source directory
 * @param {string} destDir - Destination directory
 * @param {string} description - Description for logging
 */
function copyDir(srcDir, destDir, description = '') {
  fs.mkdirSync(destDir, { recursive: true });

  if (!fs.existsSync(srcDir)) {
    console.log(`Source directory not found: ${srcDir}`);
    return;
  }

  const files = fs.readdirSync(srcDir);
  let copiedCount = 0;

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, file);

    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
      copiedCount++;
    }
  }

  if (copiedCount > 0) {
    console.log(`${description ? `${description}: ` : ''}Copied ${copiedCount} file(s)`);
  }
}

// Get package name from command line argument
const packageName = process.argv[2];

if (!packageName) {
  console.error('Error: Package name is required');
  console.error('Usage: node scripts/copy-assets.js <package-name>');
  console.error('Examples:');
  console.error('  node scripts/copy-assets.js core');
  console.error('  node scripts/copy-assets.js fonts-jp');
  process.exit(1);
}

const packagesDir = path.join(rootDir, 'packages');
const packageDir = path.join(packagesDir, packageName);

if (!fs.existsSync(packageDir)) {
  console.error(`Error: Package directory not found: ${packageDir}`);
  process.exit(1);
}

console.log(`Copying assets for package: ${packageName}`);

if (packageName === 'core') {
  // Copy WASM file for core package
  // WASM file must be in dist/ directly because the bundled code resolves it
  // relative to import.meta.url (which points to dist/index.js)
  const srcWasmDir = path.join(packageDir, 'src', 'pdfium', 'wasm');
  const distDir = path.join(packageDir, 'dist');

  console.log('WASM files:');
  const wasmFile = 'pdfium.esm.wasm';
  const srcPath = path.join(srcWasmDir, wasmFile);
  const destPath = path.join(distDir, wasmFile);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    const stat = fs.statSync(srcPath);
    console.log(`  ✓ ${wasmFile} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    console.log('WASM: Copied 1 file(s)');
  } else {
    console.log(`Source file not found: ${srcPath}`);
  }
} else if (packageName.startsWith('fonts-')) {
  // Copy font files for font packages
  const srcFontsDir = path.join(packageDir, 'fonts');
  const distFontsDir = path.join(packageDir, 'dist', 'fonts');

  console.log('Font files:');
  copyDir(srcFontsDir, distFontsDir, 'Fonts');
} else {
  console.error(`Error: Unknown package type: ${packageName}`);
  process.exit(1);
}

console.log('✓ Assets copied successfully!');
