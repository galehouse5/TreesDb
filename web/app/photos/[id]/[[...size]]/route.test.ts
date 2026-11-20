import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

const lookup = vi.hoisted(() => ({ findViewablePhoto: vi.fn() }));
vi.mock("../../_lib/lookup", () => lookup);
const authMock = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@/auth", () => authMock);

import { GET } from "./route";
import { InMemoryPhotoStore, setPhotoStoreForTests } from "../../_lib/store";

async function pngOf(width: number, height: number): Promise<Buffer> {
  return sharp({ create: { width, height, channels: 3, background: { r: 20, g: 120, b: 40 } } })
    .png()
    .toBuffer();
}

function call(id: string, size?: string) {
  return GET(new Request(`http://test/photos/${id}`), {
    params: Promise.resolve({ id, size: size ? [size] : undefined }),
  });
}

describe("GET /photos/{id}/{size}", () => {
  let store: InMemoryPhotoStore;

  beforeEach(() => {
    store = new InMemoryPhotoStore();
    setPhotoStoreForTests(store);
    lookup.findViewablePhoto.mockReset();
    authMock.auth.mockReset();
    authMock.auth.mockResolvedValue(null);
  });
  afterEach(() => setPhotoStoreForTests(null));

  it("403s a photo with no viewable reference, without touching the store", async () => {
    lookup.findViewablePhoto.mockResolvedValue(null);
    const res = await call("5", "Medium");
    expect(res.status).toBe(403);
    expect(store.objects.size).toBe(0);
  });

  it("renders a variant from the original and caches it at photos/{id}/{size}", async () => {
    lookup.findViewablePhoto.mockResolvedValue({ format: 3, isPublic: true });
    await store.putOriginal(5, await pngOf(400, 300), "image/png");

    const res = await call("5", "medium");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    const body = Buffer.from(await res.arrayBuffer());

    const cached = store.objects.get("photos/5/Medium");
    expect(cached?.contentType).toBe("image/png");
    expect(cached?.bytes.equals(body)).toBe(true);
  });

  it("serves a cached variant without reading the original", async () => {
    lookup.findViewablePhoto.mockResolvedValue({ format: 3, isPublic: true });
    const cachedBytes = await pngOf(10, 10);
    await store.putVariant(5, "Medium", cachedBytes, "image/png");
    const fetchOriginal = vi.spyOn(store, "fetchOriginal");

    const res = await call("5", "Medium");
    expect(Buffer.from(await res.arrayBuffer()).equals(cachedBytes)).toBe(true);
    expect(fetchOriginal).not.toHaveBeenCalled();
  });

  it("falls back to the legacy icon for a missing original and caches nothing", async () => {
    lookup.findViewablePhoto.mockResolvedValue({ format: 3, isPublic: true });
    const res = await call("5", "Medium");
    expect(res.status).toBe(200);
    expect(store.objects.size).toBe(0);
  });

  it("passes the signed-in user to the lookup and caches an editor-only photo privately", async () => {
    authMock.auth.mockResolvedValue({ userId: 9, roles: ["import"] });
    lookup.findViewablePhoto.mockResolvedValue({ format: 3, isPublic: false });
    await store.putOriginal(5, await pngOf(40, 30), "image/png");

    const res = await call("5", "SquareThumbnail");
    expect(lookup.findViewablePhoto).toHaveBeenCalledWith(5, { userId: 9, roles: ["import"] });
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("private, max-age=300");
  });

  it("caches a public photo for a year", async () => {
    lookup.findViewablePhoto.mockResolvedValue({ format: 3, isPublic: true });
    await store.putOriginal(5, await pngOf(40, 30), "image/png");
    const res = await call("5", "Square");
    expect(lookup.findViewablePhoto).toHaveBeenCalledWith(5, null);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
  });

  it("still serves the photo when caching the variant fails", async () => {
    lookup.findViewablePhoto.mockResolvedValue({ format: 3, isPublic: true });
    await store.putOriginal(5, await pngOf(400, 300), "image/png");
    vi.spyOn(store, "putVariant").mockRejectedValue(new Error("blob down"));
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await call("5", "Medium");
    expect(res.status).toBe(200);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
