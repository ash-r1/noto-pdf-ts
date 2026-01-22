---
"@noto-pdf-ts/fonts-all": patch
"@noto-pdf-ts/fonts-jp": patch
"@noto-pdf-ts/fonts-kr": patch
"@noto-pdf-ts/fonts-sc": patch
"@noto-pdf-ts/fonts-tc": patch
"@noto-pdf-ts/fonts-cjk": patch
---

Fix font files not being included in published packages

- Font files are now stored in the repository via Git LFS
- Fixed download-fonts.js script bugs (bracket escaping, wrong paths)
- All 24 Noto Sans fonts (~59MB) are now properly included in fonts-all
