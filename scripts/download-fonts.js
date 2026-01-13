#!/usr/bin/env node
/**
 * Download Noto Sans CJK fonts from noto-cjk GitHub releases.
 *
 * This script downloads font files from noto-cjk Sans2.004 release and
 * extracts them to the appropriate font package directories.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(__dirname);
const packagesDir = path.join(rootDir, 'packages');
const tmpDir = path.join(rootDir, '.tmp-fonts');

const BASE_URL = 'https://github.com/notofonts/noto-cjk/releases/download/Sans2.004';

// Font file mappings
// Note: Using Variable Fonts (VF) from Sans2.004 release
const FONT_MAPPINGS = [
  {
    package: 'fonts-jp',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansJP-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansJP-VF.ttf'
  },
  {
    package: 'fonts-kr',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansKR-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansKR-VF.ttf'
  },
  {
    package: 'fonts-sc',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansSC-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansSC-VF.ttf'
  },
  {
    package: 'fonts-tc',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansTC-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansTC-VF.ttf'
  },
  {
    package: 'fonts-cjk',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansCJK-VF.ttf.ttc',
    archivePath: 'Variable/OTC/NotoSansCJK-VF.ttf.ttc'
  }
];

/**
 * Check if a command is available in the system
 */
function isCommandAvailable(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Download a file using curl
 */
function downloadFile(url, outputPath) {
  console.log(`Downloading ${url}...`);
  execSync(`curl -L -o "${outputPath}" "${url}"`, { stdio: 'inherit' });
}

/**
 * Extract specific files from a zip archive
 */
function extractFromZip(zipPath, filePattern, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    // Extract specific file(s) matching the pattern
    execSync(`unzip -o "${zipPath}" "${filePattern}" -d "${outputDir}"`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`Failed to extract ${filePattern} from ${zipPath}`);
    throw error;
  }
}

/**
 * Main download function
 */
function downloadFonts() {
  // Check for required commands
  if (!isCommandAvailable('curl')) {
    console.error('Error: curl command not found. Please install curl.');
    process.exit(1);
  }

  if (!isCommandAvailable('unzip')) {
    console.error('Error: unzip command not found. Please install unzip.');
    process.exit(1);
  }

  // Create temporary directory
  fs.mkdirSync(tmpDir, { recursive: true });

  const downloadedArchives = new Set();
  let skippedCount = 0;
  let downloadedCount = 0;

  try {
    for (const mapping of FONT_MAPPINGS) {
      const fontPackageDir = path.join(packagesDir, mapping.package);
      const fontsDir = path.join(fontPackageDir, 'fonts');
      const targetFontPath = path.join(fontsDir, mapping.file);

      // Check if font already exists
      if (fs.existsSync(targetFontPath)) {
        console.log(`✓ Font already exists: ${mapping.package}/${mapping.file}`);
        skippedCount++;
        continue;
      }

      // Create fonts directory
      fs.mkdirSync(fontsDir, { recursive: true });

      // Download archive if not already downloaded
      const archivePath = path.join(tmpDir, mapping.archive);
      if (!downloadedArchives.has(mapping.archive)) {
        const archiveUrl = `${BASE_URL}/${mapping.archive}`;
        downloadFile(archiveUrl, archivePath);
        downloadedArchives.add(mapping.archive);
      }

      // Extract the specific font file
      console.log(`Extracting ${mapping.archivePath} from ${mapping.archive}...`);
      const extractDir = path.join(tmpDir, 'extract', mapping.package);
      extractFromZip(archivePath, mapping.archivePath, extractDir);

      // Move the extracted font to the package fonts directory
      const extractedFontPath = path.join(extractDir, mapping.archivePath);
      if (!fs.existsSync(extractedFontPath)) {
        console.error(`Error: Extracted font not found at ${extractedFontPath}`);
        continue;
      }

      fs.renameSync(extractedFontPath, targetFontPath);
      console.log(`✓ Installed: ${mapping.package}/${mapping.file}`);
      downloadedCount++;
    }
  } finally {
    // Cleanup temporary directory
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log('\nCleaned up temporary files.');
    }
  }

  console.log('\nFont download summary:');
  console.log(`  Downloaded: ${downloadedCount}`);
  console.log(`  Skipped (already exists): ${skippedCount}`);
  console.log(`  Total: ${downloadedCount + skippedCount}`);
}

// Run the script
try {
  downloadFonts();
  console.log('\n✓ Font download completed successfully!');
} catch (error) {
  console.error('\n✗ Font download failed:', error.message);
  process.exit(1);
}
