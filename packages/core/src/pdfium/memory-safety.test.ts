/**
 * Tests for WASM memory safety.
 *
 * These tests verify that HEAP32/HEAPU8 references are correctly
 * handled when WASM memory grows during malloc operations.
 *
 * Issue: When WebAssembly memory grows, existing typed array views
 * (HEAP32, HEAPU8) become detached and accessing them causes
 * "memory access out of bounds" errors.
 */

import { describe, expect, it } from 'vitest';
import type { PDFiumModule } from './types.js';

/**
 * Force WASM memory to grow by allocating until buffer changes.
 * Does NOT free the allocated memory - caller must handle cleanup.
 */
function forceMemoryGrowth(module: PDFiumModule): { ptrs: number[]; grew: boolean } {
  const originalBuffer = module.HEAP32.buffer;
  const ptrs: number[] = [];
  const chunkSize = 64 * 1024 * 4; // 256KB chunks

  // Keep allocating until memory grows or we've allocated 32MB
  const maxAttempts = 128;
  for (let i = 0; i < maxAttempts; i++) {
    const ptr = module.wasmExports.malloc(chunkSize);
    ptrs.push(ptr);

    if (module.HEAP32.buffer !== originalBuffer) {
      return { ptrs, grew: true };
    }
  }

  return { ptrs, grew: false };
}

/**
 * Frees all pointers in the array.
 */
function freeAll(module: PDFiumModule, ptrs: number[]): void {
  for (const ptr of ptrs) {
    module.wasmExports.free(ptr);
  }
}

describe('WASM memory safety', () => {
  /**
   * This test verifies the fundamental issue: when WASM memory grows,
   * old typed array references become invalid (detached).
   */
  it('should demonstrate that HEAP references become stale after memory growth', async () => {
    const { loadPdfiumLite } = await import('./wasm-lite.js');
    const module = await loadPdfiumLite();

    // Capture current HEAP32 reference
    const oldHEAP32 = module.HEAP32;
    const oldHEAPU8 = module.HEAPU8;
    const oldBuffer = oldHEAP32.buffer;

    // Force memory growth
    const { ptrs, grew } = forceMemoryGrowth(module);

    // This test requires memory growth to be meaningful
    expect(grew).toBe(true);

    // The old buffer should be detached (byteLength = 0)
    expect(oldBuffer.byteLength).toBe(0);
    expect(oldHEAP32.buffer.byteLength).toBe(0);
    expect(oldHEAPU8.buffer.byteLength).toBe(0);

    // New references should be valid
    expect(module.HEAP32.buffer.byteLength).toBeGreaterThan(0);
    expect(module.HEAPU8.buffer.byteLength).toBeGreaterThan(0);

    // Cleanup
    freeAll(module, ptrs);
  });

  /**
   * CRITICAL TEST: Demonstrates that the buggy pattern in library.ts
   * causes writes to go to the WRONG memory location.
   *
   * This test captures HEAP32 BEFORE forcing memory growth,
   * then attempts to write using the stale reference.
   * The write either throws or silently fails (writes to detached buffer).
   */
  it('should demonstrate stale HEAP32 writes fail after memory growth', async () => {
    const { loadPdfiumLite } = await import('./wasm-lite.js');
    const module = await loadPdfiumLite();

    // Step 1: Capture HEAP32 reference BEFORE any growth
    // This simulates: const { HEAP32 } = module;
    const capturedHEAP32 = module.HEAP32;
    const originalBuffer = capturedHEAP32.buffer;

    // Step 2: Force memory growth (simulates malloc that triggers growth)
    const { ptrs, grew } = forceMemoryGrowth(module);
    expect(grew).toBe(true);

    // Verify the captured reference is now stale
    expect(capturedHEAP32.buffer).toBe(originalBuffer);
    expect(originalBuffer.byteLength).toBe(0); // Detached!

    // Step 3: Allocate a buffer to write to
    const testPtr = module.wasmExports.malloc(16);

    // Step 4: Initialize memory using FRESH reference
    module.HEAP32[testPtr >> 2] = 999;
    expect(module.HEAP32[testPtr >> 2]).toBe(999);

    // Step 5: Try to write using STALE reference (THE BUG!)
    // This is the exact pattern that causes "memory access out of bounds"
    let threwError = false;
    try {
      capturedHEAP32[testPtr >> 2] = 42;
    } catch {
      threwError = true;
    }

    // Step 6: Verify the stale write did NOT affect actual memory
    const actualValue = module.HEAP32[testPtr >> 2];

    // The write via stale reference should have failed:
    // - Either it threw an error (strict mode)
    // - Or it wrote to detached buffer (silent failure)
    // Either way, actual memory should still have original value
    expect(actualValue).toBe(999);

    // If it didn't throw, the write went to nowhere (detached buffer)
    if (!threwError) {
      // This is the "silent failure" case - equally dangerous!
      // The code thinks it wrote successfully, but the data is lost
      expect(capturedHEAP32.buffer.byteLength).toBe(0);
    }

    // Cleanup
    module.wasmExports.free(testPtr);
    freeAll(module, ptrs);
  });

  /**
   * This test verifies that the CORRECT pattern always works.
   * Always use module.HEAP32 directly after malloc, never a captured reference.
   */
  it('should succeed with fresh HEAP32 reference after memory growth', async () => {
    const { loadPdfiumLite } = await import('./wasm-lite.js');
    const module = await loadPdfiumLite();

    // Force memory growth first
    const { ptrs, grew } = forceMemoryGrowth(module);
    expect(grew).toBe(true);

    // Allocate a buffer
    const testPtr = module.wasmExports.malloc(16);

    // Write using FRESH reference (correct pattern)
    module.HEAP32[testPtr >> 2] = 42;

    // Verify write succeeded
    expect(module.HEAP32[testPtr >> 2]).toBe(42);

    // Cleanup
    module.wasmExports.free(testPtr);
    freeAll(module, ptrs);
  });

  /**
   * This test replicates the FIXED code pattern in initLibraryConfig().
   *
   * Sequence:
   * 1. Force memory growth (simulating low-memory environment)
   * 2. Allocate config
   * 3. Write using FRESH module.HEAP32 reference (the fix!)
   * 4. Verify write succeeded
   *
   * This test should PASS with the fixed pattern.
   */
  it('should write config correctly using initLibraryConfig pattern', async () => {
    const { loadPdfiumLite } = await import('./wasm-lite.js');
    const module = await loadPdfiumLite();

    // ========================================
    // Simulate the FIXED pattern from library.ts:107-127
    // ========================================

    const { wasmExports } = module;

    // Force memory growth to simulate what happens when
    // the initial WASM memory is small and malloc triggers growth
    const { ptrs: growthPtrs, grew } = forceMemoryGrowth(module);
    expect(grew).toBe(true);

    // Allocate config
    const CONFIG_SIZE = 24;
    const configPtr = wasmExports.malloc(CONFIG_SIZE);

    // Write using FRESH module.HEAP32 reference (the fix!)
    // NOTE: Always use module.HEAP32 after malloc as memory may have grown
    for (let i = 0; i < CONFIG_SIZE / 4; i++) {
      module.HEAP32[(configPtr >> 2) + i] = 0;
    }
    module.HEAP32[configPtr >> 2] = 2; // Set version = 2

    // ========================================
    // Verify: Did the write actually work?
    // ========================================

    const versionValue = module.HEAP32[configPtr >> 2];

    // With the fixed pattern, version should be 2
    expect(versionValue).toBe(2);

    // Cleanup
    wasmExports.free(configPtr);
    freeAll(module, growthPtrs);
  });

  /**
   * Integration test: verify PDFiumLibrary.init() works.
   */
  it('should initialize library without memory access errors', async () => {
    const { PDFiumLibrary } = await import('./index.js');

    const library = await PDFiumLibrary.init();

    expect(library).toBeDefined();
    expect(library.getModule()).toBeDefined();

    library.destroy();
  });
});
