import sharp from "sharp";
import { describe, expect, it } from "vitest";
import {
  computeNormalizedGeometry,
  normalizePhotoBuffer,
  PHOTO_SIZE_NAMES,
  PHOTO_SIZES,
  canonicalizePhotoSizeName,
} from "./photo-size";

describe("canonicalizePhotoSizeName", () => {
  it("matches every enum name case-insensitively", () => {
    expect(canonicalizePhotoSizeName("original")).toBe("Original");
    expect(canonicalizePhotoSizeName("MAPSQUARE")).toBe("MapSquare");
    expect(canonicalizePhotoSizeName("SmallMapSquare")).toBe("SmallMapSquare");
    expect(canonicalizePhotoSizeName("miniMAPsquare")).toBe("MiniMapSquare");
  });

  it("returns null for an unknown size segment", () => {
    expect(canonicalizePhotoSizeName("Huge")).toBeNull();
    expect(canonicalizePhotoSizeName("")).toBeNull();
  });
});

describe("PHOTO_SIZES constants (transcribed from PhotoSize.cs)", () => {
  it("SmallMapSquare and MapSquare have distinct constants despite the legacy .Size mislabel", () => {
    expect(PHOTO_SIZES.MapSquare).toMatchObject({ maxWidthOrHeight: 60, borderWidth: 3 });
    expect(PHOTO_SIZES.SmallMapSquare).toMatchObject({ maxWidthOrHeight: 30, borderWidth: 2 });
  });

  it("every square size and its border width, per doc 01 §11", () => {
    expect(PHOTO_SIZES.SquareThumbnail).toMatchObject({ square: true, maxWidthOrHeight: 100, borderWidth: 0 });
    expect(PHOTO_SIZES.Square).toMatchObject({ square: true, maxWidthOrHeight: 60, borderWidth: 0 });
    expect(PHOTO_SIZES.MiniSquare).toMatchObject({ square: true, maxWidthOrHeight: 32, borderWidth: 0 });
    expect(PHOTO_SIZES.MiniMapSquare).toMatchObject({ square: true, maxWidthOrHeight: 15, borderWidth: 1 });
  });

  it("every non-square size, per doc 01 §11", () => {
    expect(PHOTO_SIZES.Large).toMatchObject({ square: false, maxWidthOrHeight: 800, borderWidth: 0 });
    expect(PHOTO_SIZES.Medium).toMatchObject({ square: false, maxWidthOrHeight: 500, borderWidth: 0 });
    expect(PHOTO_SIZES.Small).toMatchObject({ square: false, maxWidthOrHeight: 240, borderWidth: 0 });
    expect(PHOTO_SIZES.Thumbnail).toMatchObject({ square: false, maxWidthOrHeight: 100, borderWidth: 0 });
  });
});

describe("computeNormalizedGeometry - Original (passthrough)", () => {
  it("keeps exact source dimensions, no border", () => {
    const g = computeNormalizedGeometry(4000, 3000, "Original");
    expect(g).toEqual({ canvasWidth: 4000, canvasHeight: 3000, drawX: 0, drawY: 0, drawWidth: 4000, drawHeight: 3000, borderWidth: 0 });
  });
});

describe("computeNormalizedGeometry - non-square fit (Large/Medium/Small/Thumbnail)", () => {
  it("landscape 4000x3000 -> Large (800): fit ratio = min(800/4000, 800/3000) = 0.2 -> 800x600", () => {
    const g = computeNormalizedGeometry(4000, 3000, "Large");
    expect(g.canvasWidth).toBe(800);
    expect(g.canvasHeight).toBe(600);
    expect(g.borderWidth).toBe(0);
  });

  it("portrait 1200x1600 -> Medium (500): fit ratio = min(500/1200, 500/1600)=500/1600=0.3125 -> 375x500", () => {
    const g = computeNormalizedGeometry(1200, 1600, "Medium");
    expect(g.canvasWidth).toBe(375);
    expect(g.canvasHeight).toBe(500);
  });

  it("upscaling a small source (20x15) to Thumbnail (100): ratio = min(100/20, 100/15) = 100/20 = 5 -> 100x75", () => {
    const g = computeNormalizedGeometry(20, 15, "Thumbnail");
    expect(g.canvasWidth).toBe(100);
    expect(g.canvasHeight).toBe(75);
  });

  it("rounding: 333x1000 -> Small (240): ratio = 240/1000 = 0.24 -> round(333*0.24)=round(79.92)=80 x 240", () => {
    const g = computeNormalizedGeometry(333, 1000, "Small");
    expect(g.canvasWidth).toBe(80);
    expect(g.canvasHeight).toBe(240);
  });
});

describe("computeNormalizedGeometry - square center-crop, no border (SquareThumbnail/Square/MiniSquare)", () => {
  it("landscape 4000x3000 -> Square (60): canvas is always 60x60 regardless of aspect", () => {
    const g = computeNormalizedGeometry(4000, 3000, "Square");
    expect(g.canvasWidth).toBe(60);
    expect(g.canvasHeight).toBe(60);
    expect(g.borderWidth).toBe(0);
    // cover ratio = max(60/4000, 60/3000) = 60/3000 = 0.02 -> drawn 80x60, centered (x offset negative)
    expect(g.drawWidth).toBeCloseTo(80, 5);
    expect(g.drawHeight).toBeCloseTo(60, 5);
    expect(g.drawX).toBeCloseTo(-10, 5); // -((80-60)/2)
    expect(g.drawY).toBeCloseTo(0, 5);
  });

  it("portrait 1200x1600 -> MiniSquare (32): canvas 32x32", () => {
    const g = computeNormalizedGeometry(1200, 1600, "MiniSquare");
    expect(g.canvasWidth).toBe(32);
    expect(g.canvasHeight).toBe(32);
  });
});

describe("computeNormalizedGeometry - square center-crop WITH border (MapSquare/SmallMapSquare/MiniMapSquare)", () => {
  it("MapSquare (60, border 3): canvas stays 60x60 -- border overlays, does not extend the canvas", () => {
    const g = computeNormalizedGeometry(4000, 3000, "MapSquare");
    expect(g.canvasWidth).toBe(60);
    expect(g.canvasHeight).toBe(60);
    expect(g.borderWidth).toBe(3);
    // adjustedMax = 60 - 2*3 = 54; ratio = max(54/4000, 54/3000) = 54/3000 = 0.018 -> drawn 72x54
    expect(g.drawWidth).toBeCloseTo(72, 5);
    expect(g.drawHeight).toBeCloseTo(54, 5);
  });

  it("SmallMapSquare (30, border 2) is NOT MapSquare's numbers (30/2, not 60/3)", () => {
    const g = computeNormalizedGeometry(4000, 3000, "SmallMapSquare");
    expect(g.canvasWidth).toBe(30);
    expect(g.canvasHeight).toBe(30);
    expect(g.borderWidth).toBe(2);
  });

  it("MiniMapSquare (15, border 1)", () => {
    const g = computeNormalizedGeometry(4000, 3000, "MiniMapSquare");
    expect(g.canvasWidth).toBe(15);
    expect(g.canvasHeight).toBe(15);
    expect(g.borderWidth).toBe(1);
  });
});

// --- sharp-on-a-generated-in-memory-image tests (per task brief: "pure
// function + sharp on a generated test image in-memory") -----------------

async function makeTestImage(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: { r: 100, g: 150, b: 80 } },
  })
    .jpeg()
    .toBuffer();
}

describe("normalizePhotoBuffer - decoded output dimensions match computeNormalizedGeometry (doc 07 §5.5)", () => {
  it.each(PHOTO_SIZE_NAMES)("%s on a 400x300 source", async (sizeName) => {
    const source = await makeTestImage(400, 300);
    const expected = computeNormalizedGeometry(400, 300, sizeName);
    const output = await normalizePhotoBuffer(source, sizeName, "jpeg");
    const outMeta = await sharp(output).metadata();
    expect(outMeta.width).toBe(expected.canvasWidth);
    expect(outMeta.height).toBe(expected.canvasHeight);
    expect(outMeta.format).toBe("jpeg");
  });

  it("re-encodes to the requested output format regardless of source format (fallback-icon quirk, PhotosController.ViewPhoto)", async () => {
    const source = await makeTestImage(120, 90); // a JPEG source
    const output = await normalizePhotoBuffer(source, "Thumbnail", "png");
    const outMeta = await sharp(output).metadata();
    expect(outMeta.format).toBe("png");
    expect(outMeta.width).toBe(100);
    expect(outMeta.height).toBe(75);
  });

  it("a portrait source through MapSquare produces a bordered 60x60 square", async () => {
    const source = await makeTestImage(300, 900);
    const output = await normalizePhotoBuffer(source, "MapSquare", "jpeg");
    const outMeta = await sharp(output).metadata();
    expect(outMeta.width).toBe(60);
    expect(outMeta.height).toBe(60);
  });
});
