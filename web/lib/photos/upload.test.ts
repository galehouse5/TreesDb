import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { MAX_UPLOAD_BYTES, PhotoFormat, PhotoUploadError, preparePhotoUpload } from "./upload";

const solid = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: { r: 30, g: 110, b: 50 } } });

describe("preparePhotoUpload", () => {
  it("accepts a JPEG, sniffed from the bytes", async () => {
    const p = await preparePhotoUpload(await solid(40, 30).jpeg().toBuffer());
    expect(p).toMatchObject({ width: 40, height: 30, format: PhotoFormat.Jpeg, contentType: "image/jpeg" });
    expect((await sharp(p.bytes).metadata()).format).toBe("jpeg");
  });

  it("accepts a PNG", async () => {
    const p = await preparePhotoUpload(await solid(20, 10).png().toBuffer());
    expect(p).toMatchObject({ width: 20, height: 10, format: PhotoFormat.Png, contentType: "image/png" });
  });

  it("keeps a GIF byte-for-byte", async () => {
    const gif = await solid(12, 8).gif().toBuffer();
    const p = await preparePhotoUpload(gif);
    expect(p).toMatchObject({ width: 12, height: 8, format: PhotoFormat.Gif, contentType: "image/gif" });
    expect(p.bytes.equals(gif)).toBe(true);
  });

  it("applies EXIF orientation and drops the metadata", async () => {
    // Orientation 6 = rotate 90° clockwise to display, so 40x30 stored shows as 30x40.
    const rotated = await solid(40, 30).jpeg().withMetadata({ orientation: 6 }).toBuffer();
    const p = await preparePhotoUpload(rotated);
    expect([p.width, p.height]).toEqual([30, 40]);
    const meta = await sharp(p.bytes).metadata();
    expect(meta.orientation).toBeUndefined();
    expect(meta.exif).toBeUndefined();
  });

  it("rejects other image formats and non-images with legacy's message", async () => {
    const webp = await solid(10, 10).webp().toBuffer();
    await expect(preparePhotoUpload(webp)).rejects.toThrow("Photo must be in a proper format.");
    await expect(preparePhotoUpload(Buffer.from("not an image at all"))).rejects.toBeInstanceOf(PhotoUploadError);
  });

  it("rejects an empty upload and one over the upload cap", async () => {
    await expect(preparePhotoUpload(Buffer.alloc(0))).rejects.toThrow("Choose a photo");
    await expect(preparePhotoUpload(Buffer.alloc(MAX_UPLOAD_BYTES + 1))).rejects.toThrow(
      "Photo must not be too large.",
    );
  });
});
