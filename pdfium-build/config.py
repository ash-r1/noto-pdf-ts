"""
PDFium WASM build configuration.

This configuration supports two build variants:
- Full: With Noto CJK fonts embedded (--embed-file)
- Lite: Without fonts, FS API enabled for runtime font loading

Both variants export the FS module for font management.
"""

# PDFium version to build
PDFIUM_VERSION = "chromium/6721"

# Font files to embed in the full build
EMBED_FONTS_DIR = "/embed-fonts"
EMBED_FONTS_TARGET = "/fonts"  # Target path in WASM virtual filesystem

# Exported PDFium functions (minimal set for rendering)
EXPORTED_FUNCTIONS = [
    # Library management
    "_PDFium_Init",
    "_FPDF_InitLibrary",
    "_FPDF_InitLibraryWithConfig",
    "_FPDF_DestroyLibrary",
    "_FPDF_SetSandBoxPolicy",

    # Document handling
    "_FPDF_LoadDocument",
    "_FPDF_LoadMemDocument",
    "_FPDF_CloseDocument",
    "_FPDF_GetLastError",
    "_FPDF_GetPageCount",

    # Page handling
    "_FPDF_LoadPage",
    "_FPDF_ClosePage",
    "_FPDF_GetPageWidth",
    "_FPDF_GetPageHeight",
    "_FPDF_GetPageWidthF",
    "_FPDF_GetPageHeightF",

    # Rendering
    "_FPDF_RenderPageBitmap",
    "_FPDF_RenderPageBitmapWithMatrix",
    "_FPDF_FFLDraw",

    # Bitmap handling
    "_FPDFBitmap_Create",
    "_FPDFBitmap_CreateEx",
    "_FPDFBitmap_Destroy",
    "_FPDFBitmap_FillRect",
    "_FPDFBitmap_GetBuffer",
    "_FPDFBitmap_GetWidth",
    "_FPDFBitmap_GetHeight",
    "_FPDFBitmap_GetStride",
    "_FPDFBitmap_GetFormat",

    # Text extraction
    "_FPDFText_LoadPage",
    "_FPDFText_ClosePage",
    "_FPDFText_CountChars",
    "_FPDFText_GetText",
    "_FPDFText_GetUnicode",
    "_FPDFText_GetFontSize",
    "_FPDFText_GetCharBox",

    # Page objects
    "_FPDFPage_CountObjects",
    "_FPDFPage_GetObject",
    "_FPDFPageObj_GetType",

    # Image objects
    "_FPDFImageObj_GetBitmap",
    "_FPDFImageObj_GetRenderedBitmap",
    "_FPDFImageObj_GetImagePixelSize",
    "_FPDFImageObj_GetImageDataRaw",
    "_FPDFImageObj_GetImageFilterCount",
    "_FPDFImageObj_GetImageFilter",

    # Form handling
    "_FPDFDOC_InitFormFillEnvironment",
    "_FPDFDOC_ExitFormFillEnvironment",
    "_FORM_OnAfterLoadPage",
    "_FORM_OnBeforeClosePage",

    # Memory management
    "_malloc",
    "_free",
]

# Emscripten runtime methods to export
# FS is required for font file operations in both variants
EXPORTED_RUNTIME_METHODS = [
    "ccall",
    "cwrap",
    "wasmExports",
    "HEAP8",
    "HEAP16",
    "HEAP32",
    "HEAPU8",
    "HEAPU16",
    "HEAPU32",
    "HEAPF32",
    "HEAPF64",
    "addFunction",
    "removeFunction",
    "setValue",
    "getValue",
    "UTF8ToString",
    "stringToUTF8",
    "lengthBytesUTF8",
    "FS",  # Critical: Required for font file operations
]

# Base Emscripten compiler flags (common to both variants)
BASE_EMSCRIPTEN_FLAGS = [
    # WASM output
    "-s", "WASM=1",

    # Module format
    "-s", "MODULARIZE=1",
    "-s", "EXPORT_ES6=1",

    # Memory configuration
    "-s", "ALLOW_MEMORY_GROWTH=1",
    "-s", "INITIAL_MEMORY=33554432",  # 32MB
    "-s", "MAXIMUM_MEMORY=536870912",  # 512MB

    # Filesystem support (required for font loading)
    "-s", "FORCE_FILESYSTEM=1",

    # Runtime features
    "-s", "ALLOW_TABLE_GROWTH=1",
    "-s", "ASSERTIONS=0",

    # Dependencies
    "-s", "USE_ZLIB=1",
    "-s", "USE_LIBJPEG=1",
    "-s", "USE_LIBPNG=1",

    # Optimization
    "-O3",
    "--closure", "0",
]


def get_build_config(variant: str) -> dict:
    """
    Get build configuration for a specific variant.

    Args:
        variant: Either "full" or "lite"

    Returns:
        Dictionary with build configuration
    """
    if variant not in ("full", "lite"):
        raise ValueError(f"Unknown variant: {variant}")

    config = {
        "variant": variant,
        "output_name": f"pdfium-{variant}",
        "export_name": f"loadPdfium{'Full' if variant == 'full' else 'Lite'}",
        "flags": BASE_EMSCRIPTEN_FLAGS.copy(),
        "embed_fonts": variant == "full",
    }

    # Add export name
    config["flags"].extend(["-s", f"EXPORT_NAME={config['export_name']}"])

    # Add output file
    config["flags"].extend(["-o", f"{config['output_name']}.js"])

    # Add font embedding for full variant
    if config["embed_fonts"]:
        config["flags"].extend([
            "--embed-file", f"{EMBED_FONTS_DIR}@{EMBED_FONTS_TARGET}",
        ])

    return config


# Font directories that PDFium will search
DEFAULT_FONT_PATHS = [
    "/fonts",
    "/usr/share/fonts",
    "/usr/share/X11/fonts/Type1",
    "/usr/share/X11/fonts/TTF",
    "/usr/local/share/fonts",
]
