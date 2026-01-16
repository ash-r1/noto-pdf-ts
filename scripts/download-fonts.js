#!/usr/bin/env node
/**
 * Download Noto Sans fonts from GitHub releases.
 *
 * This script downloads font files from noto-cjk and notofonts repositories
 * and extracts them to the appropriate font package directories.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(__dirname);
const packagesDir = path.join(rootDir, 'packages');
const tmpDir = path.join(rootDir, '.tmp-fonts');

// CJK fonts from noto-cjk repository
const CJK_BASE_URL = 'https://github.com/notofonts/noto-cjk/releases/download/Sans2.004';

// Individual script fonts from notofonts repositories
const NOTOFONTS_BASE_URL = 'https://github.com/notofonts';

// Font file mappings for CJK fonts (existing packages)
const CJK_FONT_MAPPINGS = [
  {
    package: 'fonts-jp',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansJP-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansJP-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    package: 'fonts-kr',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansKR-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansKR-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    package: 'fonts-sc',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansSC-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansSC-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    package: 'fonts-tc',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansTC-VF.ttf',
    archivePath: 'Variable/TTF/Subset/NotoSansTC-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    package: 'fonts-cjk',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    file: 'NotoSansCJK-VF.ttf.ttc',
    archivePath: 'Variable/OTC/NotoSansCJK-VF.ttf.ttc',
    baseUrl: CJK_BASE_URL,
  },
];

// Font file mappings for fonts-all package
// Using Variable Fonts where available for consistency
const FONTS_ALL_MAPPINGS = [
  // CJK fonts (same as individual packages)
  {
    file: 'NotoSansJP-VF.ttf',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    archivePath: 'Variable/TTF/Subset/NotoSansJP-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    file: 'NotoSansKR-VF.ttf',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    archivePath: 'Variable/TTF/Subset/NotoSansKR-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    file: 'NotoSansSC-VF.ttf',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    archivePath: 'Variable/TTF/Subset/NotoSansSC-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  {
    file: 'NotoSansTC-VF.ttf',
    archive: '02_NotoSansCJK-TTF-VF.zip',
    archivePath: 'Variable/TTF/Subset/NotoSansTC-VF.ttf',
    baseUrl: CJK_BASE_URL,
  },
  // Latin/Greek/Cyrillic
  {
    file: 'NotoSans[wdth,wght].ttf',
    repo: 'latin-greek-cyrillic',
    release: 'NotoSans-v2.015',
    archivePath: 'NotoSans/full/variable-ttf/NotoSans[wdth,wght].ttf',
  },
  // Arabic
  {
    file: 'NotoSansArabic[wdth,wght].ttf',
    repo: 'arabic',
    release: 'NotoSansArabic-v2.014',
    archivePath: 'NotoSansArabic/full/variable-ttf/NotoSansArabic[wdth,wght].ttf',
  },
  // Hebrew
  {
    file: 'NotoSansHebrew[wdth,wght].ttf',
    repo: 'hebrew',
    release: 'NotoSansHebrew-v3.001',
    archivePath: 'NotoSansHebrew/full/variable-ttf/NotoSansHebrew[wdth,wght].ttf',
  },
  // Devanagari
  {
    file: 'NotoSansDevanagari[wdth,wght].ttf',
    repo: 'devanagari',
    release: 'NotoSansDevanagari-v2.006',
    archivePath: 'NotoSansDevanagari/full/variable-ttf/NotoSansDevanagari[wdth,wght].ttf',
  },
  // Bengali
  {
    file: 'NotoSansBengali[wdth,wght].ttf',
    repo: 'bengali',
    release: 'NotoSansBengali-v3.011',
    archivePath: 'NotoSansBengali/full/variable-ttf/NotoSansBengali[wdth,wght].ttf',
  },
  // Tamil
  {
    file: 'NotoSansTamil[wdth,wght].ttf',
    repo: 'tamil',
    release: 'NotoSansTamil-v2.004',
    archivePath: 'NotoSansTamil/full/variable-ttf/NotoSansTamil[wdth,wght].ttf',
  },
  // Telugu
  {
    file: 'NotoSansTelugu[wdth,wght].ttf',
    repo: 'telugu',
    release: 'NotoSansTelugu-v2.005',
    archivePath: 'NotoSansTelugu/full/variable-ttf/NotoSansTelugu[wdth,wght].ttf',
  },
  // Gujarati
  {
    file: 'NotoSansGujarati[wdth,wght].ttf',
    repo: 'gujarati',
    release: 'NotoSansGujarati-v2.106',
    archivePath: 'NotoSansGujarati/full/variable-ttf/NotoSansGujarati[wdth,wght].ttf',
  },
  // Kannada
  {
    file: 'NotoSansKannada[wdth,wght].ttf',
    repo: 'kannada',
    release: 'NotoSansKannada-v2.006',
    archivePath: 'NotoSansKannada/full/variable-ttf/NotoSansKannada[wdth,wght].ttf',
  },
  // Malayalam
  {
    file: 'NotoSansMalayalam[wdth,wght].ttf',
    repo: 'malayalam',
    release: 'NotoSansMalayalam-v2.104',
    archivePath: 'NotoSansMalayalam/full/variable-ttf/NotoSansMalayalam[wdth,wght].ttf',
  },
  // Oriya
  {
    file: 'NotoSansOriya[wdth,wght].ttf',
    repo: 'oriya',
    release: 'NotoSansOriya-v2.006',
    archivePath: 'NotoSansOriya/full/variable-ttf/NotoSansOriya[wdth,wght].ttf',
  },
  // Gurmukhi
  {
    file: 'NotoSansGurmukhi[wdth,wght].ttf',
    repo: 'gurmukhi',
    release: 'NotoSansGurmukhi-v2.004',
    archivePath: 'NotoSansGurmukhi/full/variable-ttf/NotoSansGurmukhi[wdth,wght].ttf',
  },
  // Sinhala
  {
    file: 'NotoSansSinhala[wdth,wght].ttf',
    repo: 'sinhala',
    release: 'NotoSansSinhala-v3.000',
    archivePath: 'NotoSansSinhala/full/variable-ttf/NotoSansSinhala[wdth,wght].ttf',
  },
  // Thai
  {
    file: 'NotoSansThai[wdth,wght].ttf',
    repo: 'thai',
    release: 'NotoSansThai-v2.002',
    archivePath: 'NotoSansThai/full/variable-ttf/NotoSansThai[wdth,wght].ttf',
  },
  // Lao
  {
    file: 'NotoSansLao[wdth,wght].ttf',
    repo: 'lao',
    release: 'NotoSansLao-v2.003',
    archivePath: 'NotoSansLao/full/variable-ttf/NotoSansLao[wdth,wght].ttf',
  },
  // Myanmar
  {
    file: 'NotoSansMyanmar[wdth,wght].ttf',
    repo: 'myanmar',
    release: 'NotoSansMyanmar-v2.107',
    archivePath: 'NotoSansMyanmar/full/variable-ttf/NotoSansMyanmar[wdth,wght].ttf',
  },
  // Khmer
  {
    file: 'NotoSansKhmer[wdth,wght].ttf',
    repo: 'khmer',
    release: 'NotoSansKhmer-v2.004',
    archivePath: 'NotoSansKhmer/full/variable-ttf/NotoSansKhmer[wdth,wght].ttf',
  },
  // Armenian
  {
    file: 'NotoSansArmenian[wdth,wght].ttf',
    repo: 'armenian',
    release: 'NotoSansArmenian-v2.008',
    archivePath: 'NotoSansArmenian/full/variable-ttf/NotoSansArmenian[wdth,wght].ttf',
  },
  // Georgian
  {
    file: 'NotoSansGeorgian[wdth,wght].ttf',
    repo: 'georgian',
    release: 'NotoSansGeorgian-v2.005',
    archivePath: 'NotoSansGeorgian/full/variable-ttf/NotoSansGeorgian[wdth,wght].ttf',
  },
  // Ethiopic
  {
    file: 'NotoSansEthiopic[wdth,wght].ttf',
    repo: 'ethiopic',
    release: 'NotoSansEthiopic-v2.102',
    archivePath: 'NotoSansEthiopic/full/variable-ttf/NotoSansEthiopic[wdth,wght].ttf',
  },
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
 * Download a file using curl with retry
 */
function downloadFile(url, outputPath, retries = 3) {
  console.log(`Downloading ${url}...`);
  for (let i = 0; i < retries; i++) {
    try {
      execSync(`curl -L -f -o "${outputPath}" "${url}"`, { stdio: 'inherit' });
      return;
    } catch (error) {
      if (i < retries - 1) {
        console.log(`Download failed, retrying (${i + 1}/${retries})...`);
        execSync('sleep 2');
      } else {
        throw error;
      }
    }
  }
}

/**
 * Extract specific files from a zip archive
 */
function extractFromZip(zipPath, filePattern, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });

  try {
    // Extract specific file(s) matching the pattern
    execSync(`unzip -o "${zipPath}" "${filePattern}" -d "${outputDir}"`, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`Failed to extract ${filePattern} from ${zipPath}`);
    throw error;
  }
}

/**
 * Download and extract a font from notofonts repository
 */
function downloadNotofontsFont(mapping, targetDir) {
  const zipFileName = `${mapping.release}.zip`;
  const archivePath = path.join(tmpDir, zipFileName);
  const archiveUrl = `${NOTOFONTS_BASE_URL}/${mapping.repo}/releases/download/${mapping.release}/${zipFileName}`;

  // Download if not already downloaded
  if (!fs.existsSync(archivePath)) {
    downloadFile(archiveUrl, archivePath);
  }

  // Extract the font file
  const extractDir = path.join(tmpDir, 'extract', mapping.repo);
  extractFromZip(archivePath, mapping.archivePath, extractDir);

  // Move the extracted font
  const extractedFontPath = path.join(extractDir, mapping.archivePath);
  const targetFontPath = path.join(targetDir, mapping.file);

  if (!fs.existsSync(extractedFontPath)) {
    console.error(`Error: Extracted font not found at ${extractedFontPath}`);
    return false;
  }

  fs.renameSync(extractedFontPath, targetFontPath);
  return true;
}

/**
 * Download fonts for individual CJK packages
 */
function downloadCjkPackages() {
  console.log('\n=== Downloading CJK Package Fonts ===\n');

  const downloadedArchives = new Set();
  let skippedCount = 0;
  let downloadedCount = 0;

  for (const mapping of CJK_FONT_MAPPINGS) {
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
      const archiveUrl = `${mapping.baseUrl}/${mapping.archive}`;
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

  return { downloaded: downloadedCount, skipped: skippedCount };
}

/**
 * Download fonts for fonts-all package
 */
function downloadFontsAllPackage() {
  console.log('\n=== Downloading fonts-all Package Fonts ===\n');

  const fontsAllDir = path.join(packagesDir, 'fonts-all');
  const fontsDir = path.join(fontsAllDir, 'fonts');

  // Check if fonts-all package exists
  if (!fs.existsSync(fontsAllDir)) {
    console.log('fonts-all package not found, skipping...');
    return { downloaded: 0, skipped: 0 };
  }

  fs.mkdirSync(fontsDir, { recursive: true });

  const downloadedArchives = new Map(); // Map of archive name to local path
  let skippedCount = 0;
  let downloadedCount = 0;

  for (const mapping of FONTS_ALL_MAPPINGS) {
    const targetFontPath = path.join(fontsDir, mapping.file);

    // Check if font already exists
    if (fs.existsSync(targetFontPath)) {
      console.log(`✓ Font already exists: fonts-all/${mapping.file}`);
      skippedCount++;
      continue;
    }

    try {
      if (mapping.baseUrl) {
        // CJK font from noto-cjk repository
        const archivePath = path.join(tmpDir, mapping.archive);
        if (!downloadedArchives.has(mapping.archive)) {
          const archiveUrl = `${mapping.baseUrl}/${mapping.archive}`;
          downloadFile(archiveUrl, archivePath);
          downloadedArchives.set(mapping.archive, archivePath);
        }

        console.log(`Extracting ${mapping.archivePath}...`);
        const extractDir = path.join(tmpDir, 'extract', 'fonts-all-cjk');
        extractFromZip(archivePath, mapping.archivePath, extractDir);

        const extractedFontPath = path.join(extractDir, mapping.archivePath);
        if (fs.existsSync(extractedFontPath)) {
          fs.renameSync(extractedFontPath, targetFontPath);
          console.log(`✓ Installed: fonts-all/${mapping.file}`);
          downloadedCount++;
        } else {
          console.error(`Error: Font not found at ${extractedFontPath}`);
        }
      } else {
        // Font from notofonts repository
        console.log(`Downloading ${mapping.file} from ${mapping.repo}...`);
        if (downloadNotofontsFont(mapping, fontsDir)) {
          console.log(`✓ Installed: fonts-all/${mapping.file}`);
          downloadedCount++;
        }
      }
    } catch (error) {
      console.error(`Error downloading ${mapping.file}:`, error.message);
    }
  }

  return { downloaded: downloadedCount, skipped: skippedCount };
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

  let totalDownloaded = 0;
  let totalSkipped = 0;

  try {
    // Download CJK package fonts
    const cjkResult = downloadCjkPackages();
    totalDownloaded += cjkResult.downloaded;
    totalSkipped += cjkResult.skipped;

    // Download fonts-all package fonts
    const allResult = downloadFontsAllPackage();
    totalDownloaded += allResult.downloaded;
    totalSkipped += allResult.skipped;
  } finally {
    // Cleanup temporary directory
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log('\nCleaned up temporary files.');
    }
  }

  console.log('\nFont download summary:');
  console.log(`  Downloaded: ${totalDownloaded}`);
  console.log(`  Skipped (already exists): ${totalSkipped}`);
  console.log(`  Total: ${totalDownloaded + totalSkipped}`);
}

// Run the script
try {
  downloadFonts();
  console.log('\n✓ Font download completed successfully!');
} catch (error) {
  console.error('\n✗ Font download failed:', error.message);
  process.exit(1);
}
