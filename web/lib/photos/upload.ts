/**
 * Photo upload intake for P3-08 (doc 05 §P3-08), ported from legacy's
 * `TemporaryPhoto.Create` (`TMD.Model/Photos/TemporaryPhoto.cs`) and the
 * `Photo` validation attributes (`TMD.Model/Photos/Photo.cs:16-24`).
 *
 * Legacy decoded the upload with GDI+ (`new Bitmap(stream)`), re-saved it in
 * its sniffed format (JPEG/GIF, anything else as PNG) and validated
 * `Bytes <= Photo.MaxBytes` (5 MB) and `Format != NotSpecified` on the
 * re-saved result; an undecodable upload became a `NotSpecified` photo that
 * failed validation with "Photo must be in a proper format.".
 *
 * This port:
 *   - sniffs the format from the bytes with sharp (never the file name or
 *     the browser's content type) and accepts JPEG, GIF and PNG only (doc 05
 *     §P3-08), with legacy's own messages;
 *   - re-encodes JPEG and PNG like legacy did, applying the EXIF orientation
 *     first (`rotate()`), which also drops camera metadata such as GPS and
 *     serial numbers from the stored original; GIFs are kept byte-for-byte
 *     so animation survives;
 *   - checks legacy's 5 MB limit on the stored bytes, and caps the upload
 *     itself at `MAX_UPLOAD_BYTES` because a Vercel function accepts at
 *     most a 4.5 MB request body (D-022).
 */
import sharp from "sharp";

/** `Photo.MaxBytes` (Photo.cs:13). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Largest upload accepted, under Vercel's 4.5 MB request body limit with room for the form fields. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** `PhotoFormat` (TMD.Model/Photos/IPhoto.cs:6-12). */
export const PhotoFormat = { Jpeg: 1, Gif: 2, Png: 3 } as const;
export type PhotoFormatCode = (typeof PhotoFormat)[keyof typeof PhotoFormat];

export const PHOTO_CONTENT_TYPES: Record<PhotoFormatCode, string> = {
  1: "image/jpeg",
  2: "image/gif",
  3: "image/png",
};

export interface PreparedPhoto {
  bytes: Buffer;
  width: number;
  height: number;
  format: PhotoFormatCode;
  contentType: string;
}

export class PhotoUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PhotoUploadError";
  }
}

const PROPER_FORMAT = "Photo must be in a proper format.";
const TOO_LARGE = "Photo must not be too large.";

export async function preparePhotoUpload(input: Buffer): Promise<PreparedPhoto> {
  if (input.length === 0) throw new PhotoUploadError("Choose a photo to upload.");
  if (input.length > MAX_UPLOAD_BYTES) {
    throw new PhotoUploadError(`${TOO_LARGE} Upload at most ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`);
  }

  let detected: string | undefined;
  try {
    detected = (await sharp(input).metadata()).format;
  } catch {
    throw new PhotoUploadError(PROPER_FORMAT);
  }

  let prepared: PreparedPhoto;
  try {
    if (detected === "gif") {
      const meta = await sharp(input).metadata();
      prepared = {
        bytes: input,
        width: meta.width ?? 0,
        height: meta.pageHeight ?? meta.height ?? 0,
        format: PhotoFormat.Gif,
        contentType: PHOTO_CONTENT_TYPES[PhotoFormat.Gif],
      };
    } else if (detected === "jpeg" || detected === "png") {
      const pipeline = sharp(input).rotate();
      const { data, info } = await (detected === "jpeg"
        ? pipeline.jpeg({ quality: 90 })
        : pipeline.png()
      ).toBuffer({ resolveWithObject: true });
      const format = detected === "jpeg" ? PhotoFormat.Jpeg : PhotoFormat.Png;
      prepared = { bytes: data, width: info.width, height: info.height, format, contentType: PHOTO_CONTENT_TYPES[format] };
    } else {
      throw new PhotoUploadError(PROPER_FORMAT);
    }
  } catch (err) {
    if (err instanceof PhotoUploadError) throw err;
    throw new PhotoUploadError(PROPER_FORMAT);
  }

  if (prepared.width <= 0 || prepared.height <= 0) throw new PhotoUploadError(PROPER_FORMAT);
  if (prepared.bytes.length > MAX_PHOTO_BYTES) throw new PhotoUploadError(TOO_LARGE);
  return prepared;
}
