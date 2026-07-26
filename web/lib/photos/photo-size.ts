/**
 * Photo variant geometry + resize, ported from `TMD.Model/Photos/PhotoSize.cs`
 * (task P1-12, doc 01 §11, doc 07 §5.5).
 *
 * Legacy generates every non-original variant on demand from the original
 * bitmap via GDI+ (`PhotoSizeBase.Normalize`, `System.Drawing`,
 * `InterpolationMode.HighQualityBicubic`). This module ports the *geometry*
 * math exactly (final canvas width/height, border width -- the numbers
 * doc 07 §5.5's parity check actually asserts: "decoded dimensions equal
 * ... including border widths", explicitly NOT pixel-level equality,
 * waiver W-002, since the resampler differs: sharp/libvips here vs GDI+
 * there). `normalizePhotoBuffer` then re-implements the same crop-vs-fit
 * behavior with sharp, close enough that composed images look right, but
 * only the geometry function (`computeNormalizedGeometry`) is the thing
 * parity actually pins.
 *
 * --- Square sizes (center-crop) --- `PhotoSizeBase.Normalize`, square branch:
 *   adjustedMax = maxWidthOrHeight - 2*borderWidth
 *   ratio = max(adjustedMax/srcW, adjustedMax/srcH)          // "cover"
 *   canvas = maxWidthOrHeight x maxWidthOrHeight              // always square
 *   scaled photo drawn centered at ((canvas-ratio*srcW)/2, (canvas-ratio*srcH)/2),
 *     clipped to the canvas -- i.e. a centered cover-crop.
 *   border (if any) is a `borderWidth`-px pen-stroke rectangle centered on
 *     a rect inset by borderWidth/2 from each edge -- since a GDI+ pen
 *     strokes centered on its path, this exactly paints the outer
 *     `borderWidth` px ring of the canvas; canvas size is unchanged by the
 *     border (border overlays, not extends).
 *
 * --- Non-square sizes (fit-inside) --- `PhotoSizeBase.Normalize`, else branch:
 *   adjustedMax = maxWidthOrHeight - borderWidth
 *   ratio = min(adjustedMax/srcW, adjustedMax/srcH)           // "contain"
 *   canvasW = round(ratio*srcW) + borderWidth, canvasH = round(ratio*srcH) + borderWidth
 *   photo drawn at (borderWidth, borderWidth) sized (canvasW-2*borderWidth, canvasH-2*borderWidth)
 *   (no cropping -- the ratio already preserves aspect).
 *   No shipped non-square size currently has borderWidth > 0 (this branch's
 *   border math is exercised only by the pure geometry tests below), but
 *   it's implemented for fidelity in case a future size adds one.
 *
 * --- Original --- passthrough: `new Bitmap(photo)`, i.e. exact source
 *   dimensions, no border.
 *
 * --- The `SmallMapSquare.Size` mislabel (doc 01 §13, PhotoSize.cs:123) ---
 *   `SmallMapSquarePhotoSize.Size` incorrectly returns `PhotoSize.MapSquare`
 *   instead of `PhotoSize.SmallMapSquare`. Grepping the whole legacy
 *   solution shows `.Size` is never read anywhere except its own getter
 *   definition -- `PhotoSizeFactory.Create` switches on the *requested*
 *   `PhotoSize` enum parameter, not `.Size` -- so the mislabel has zero
 *   observable effect in legacy (dead metadata). This port does not
 *   replicate the mislabel as behavior (there is nothing to replicate: no
 *   code path here ever reads a "reported own size" the way legacy's inert
 *   getter did). What IS preserved, and matters, is that SmallMapSquare's
 *   own numeric constants (30px / 2px border) stay distinct from
 *   MapSquare's (60px / 3px border) -- see `PHOTO_SIZES` below.
 */
import sharp from "sharp";

export const PHOTO_SIZE_NAMES = [
  "Original",
  "Large",
  "Medium",
  "Small",
  "Thumbnail",
  "SquareThumbnail",
  "Square",
  "MiniSquare",
  "MapSquare",
  "SmallMapSquare",
  "MiniMapSquare",
] as const;

export type PhotoSizeName = (typeof PHOTO_SIZE_NAMES)[number];

export interface PhotoSizeSpec {
  readonly name: PhotoSizeName;
  readonly square: boolean;
  /** `Infinity` for Original (int.MaxValue in legacy; treated as "no resize"). */
  readonly maxWidthOrHeight: number;
  readonly borderWidth: number;
}

// Constants transcribed 1:1 from PhotoSize.cs's per-size subclasses.
export const PHOTO_SIZES: Record<PhotoSizeName, PhotoSizeSpec> = {
  Original: { name: "Original", square: false, maxWidthOrHeight: Infinity, borderWidth: 0 },
  Large: { name: "Large", square: false, maxWidthOrHeight: 800, borderWidth: 0 },
  Medium: { name: "Medium", square: false, maxWidthOrHeight: 500, borderWidth: 0 },
  Small: { name: "Small", square: false, maxWidthOrHeight: 240, borderWidth: 0 },
  Thumbnail: { name: "Thumbnail", square: false, maxWidthOrHeight: 100, borderWidth: 0 },
  SquareThumbnail: { name: "SquareThumbnail", square: true, maxWidthOrHeight: 100, borderWidth: 0 },
  Square: { name: "Square", square: true, maxWidthOrHeight: 60, borderWidth: 0 },
  MiniSquare: { name: "MiniSquare", square: true, maxWidthOrHeight: 32, borderWidth: 0 },
  MapSquare: { name: "MapSquare", square: true, maxWidthOrHeight: 60, borderWidth: 3 },
  // NOTE: distinct from MapSquare above -- see the SmallMapSquare mislabel
  // discussion in this file's header. 30px / 2px border, never 60/3.
  SmallMapSquare: { name: "SmallMapSquare", square: true, maxWidthOrHeight: 30, borderWidth: 2 },
  MiniMapSquare: { name: "MiniMapSquare", square: true, maxWidthOrHeight: 15, borderWidth: 1 },
};

/** Case-insensitive match against the 11 `PhotoSize` enum names (route `size` segment defaults to `Original`, doc 01 §1). */
export function canonicalizePhotoSizeName(raw: string): PhotoSizeName | null {
  const lower = raw.toLowerCase();
  for (const name of PHOTO_SIZE_NAMES) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

export interface NormalizedGeometry {
  canvasWidth: number;
  canvasHeight: number;
  /** Where the scaled source image is drawn -- may be negative / exceed the canvas for a square center-crop. */
  drawX: number;
  drawY: number;
  drawWidth: number;
  drawHeight: number;
  borderWidth: number;
}

/** Port of `PhotoSizeBase.Normalize`'s geometry math (dimensions/crop-rect/border only -- no pixels). */
export function computeNormalizedGeometry(
  sourceWidth: number,
  sourceHeight: number,
  sizeName: PhotoSizeName,
): NormalizedGeometry {
  const spec = PHOTO_SIZES[sizeName];

  if (sizeName === "Original") {
    return {
      canvasWidth: sourceWidth,
      canvasHeight: sourceHeight,
      drawX: 0,
      drawY: 0,
      drawWidth: sourceWidth,
      drawHeight: sourceHeight,
      borderWidth: 0,
    };
  }

  if (spec.square) {
    const adjustedMax = spec.maxWidthOrHeight - 2 * spec.borderWidth;
    const ratio = Math.max(adjustedMax / sourceWidth, adjustedMax / sourceHeight);
    const drawWidth = ratio * sourceWidth;
    const drawHeight = ratio * sourceHeight;
    const drawX = -((drawWidth - spec.maxWidthOrHeight) / 2);
    const drawY = -((drawHeight - spec.maxWidthOrHeight) / 2);
    return {
      canvasWidth: spec.maxWidthOrHeight,
      canvasHeight: spec.maxWidthOrHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
      borderWidth: spec.borderWidth,
    };
  }

  const adjustedMax = spec.maxWidthOrHeight - spec.borderWidth;
  const ratio = Math.min(adjustedMax / sourceWidth, adjustedMax / sourceHeight);
  const canvasWidth = Math.round(ratio * sourceWidth) + spec.borderWidth;
  const canvasHeight = Math.round(ratio * sourceHeight) + spec.borderWidth;
  return {
    canvasWidth,
    canvasHeight,
    drawX: spec.borderWidth,
    drawY: spec.borderWidth,
    drawWidth: canvasWidth - 2 * spec.borderWidth,
    drawHeight: canvasHeight - 2 * spec.borderWidth,
    borderWidth: spec.borderWidth,
  };
}

export type PhotoOutputFormat = "jpeg" | "gif" | "png";

/**
 * Resizes/crops/borders `source` per `sizeName`'s geometry, then encodes to
 * `outputFormat`. Mirrors legacy's `PhotosController.ViewPhoto`, which
 * always re-encodes the normalized bitmap into the DB row's OWN
 * `PhotoFormat` (`image.Save(data, photo.ImageFormat)`) -- including when
 * the source bytes are the fallback icon (see `_lib/store.ts` in
 * `app/photos`), so `outputFormat` is a caller-supplied parameter, never
 * inferred from `source`.
 */
export async function normalizePhotoBuffer(
  source: Buffer,
  sizeName: PhotoSizeName,
  outputFormat: PhotoOutputFormat,
): Promise<Buffer> {
  const metadata = await sharp(source).metadata();
  const sourceWidth = metadata.width;
  const sourceHeight = metadata.height;
  if (!sourceWidth || !sourceHeight) {
    throw new Error("normalizePhotoBuffer: source image has no decodable dimensions");
  }

  const geometry = computeNormalizedGeometry(sourceWidth, sourceHeight, sizeName);
  const spec = PHOTO_SIZES[sizeName];

  let pipeline = sharp(source);
  if (sizeName !== "Original") {
    pipeline = spec.square
      ? pipeline.resize(geometry.canvasWidth, geometry.canvasHeight, { fit: "cover", position: "centre" })
      : pipeline.resize(Math.round(geometry.drawWidth), Math.round(geometry.drawHeight), { fit: "fill" });
  }

  if (geometry.borderWidth > 0) {
    const inset = geometry.borderWidth / 2;
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${geometry.canvasWidth}" height="${geometry.canvasHeight}">` +
        `<rect x="${inset}" y="${inset}" width="${geometry.canvasWidth - geometry.borderWidth}" ` +
        `height="${geometry.canvasHeight - geometry.borderWidth}" fill="none" stroke="white" stroke-width="${geometry.borderWidth}"/>` +
        `</svg>`,
    );
    pipeline = pipeline.composite([{ input: svg }]);
  }

  return pipeline.toFormat(outputFormat).toBuffer();
}
