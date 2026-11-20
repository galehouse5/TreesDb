import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const blob = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  list: vi.fn(),
}));
vi.mock("@vercel/blob", () => blob);

import {
  InMemoryPhotoStore,
  PhotoStoreNotConfiguredError,
  VercelBlobPhotoStore,
  createPhotoStoreProvider,
  originalKey,
  setPhotoStoreForTests,
  variantKey,
} from "./store";

function streamOf(bytes: Buffer): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(bytes));
      controller.close();
    },
  });
}

describe("keys", () => {
  it("keeps the D-008 layout", () => {
    expect(originalKey(42)).toBe("photos/42");
    expect(variantKey(42, "Medium")).toBe("photos/42/Medium");
  });
});

describe("createPhotoStoreProvider", () => {
  const saved = process.env.BLOB_READ_WRITE_TOKEN;
  afterEach(() => {
    if (saved === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = saved;
    setPhotoStoreForTests(null);
  });

  it("is unconfigured without a token: reads miss, writes throw", async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const store = createPhotoStoreProvider();
    expect(store.configured).toBe(false);
    expect(await store.fetchOriginal(1)).toBeNull();
    expect(await store.fetchVariant(1, "Medium")).toBeNull();
    await expect(store.putOriginal(1, Buffer.from("x"), "image/png")).rejects.toBeInstanceOf(
      PhotoStoreNotConfiguredError,
    );
    await expect(store.deletePhoto(1)).rejects.toBeInstanceOf(PhotoStoreNotConfiguredError);
  });

  it("uses Vercel Blob when the token is set", () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    expect(createPhotoStoreProvider()).toBeInstanceOf(VercelBlobPhotoStore);
  });

  it("honors the test override", () => {
    const fake = new InMemoryPhotoStore();
    setPhotoStoreForTests(fake);
    expect(createPhotoStoreProvider()).toBe(fake);
  });
});

describe("VercelBlobPhotoStore", () => {
  beforeEach(() => {
    for (const fn of Object.values(blob)) fn.mockReset();
  });

  it("reads a blob by pathname and returns its bytes", async () => {
    blob.get.mockResolvedValue({ statusCode: 200, stream: streamOf(Buffer.from("abc")) });
    const store = new VercelBlobPhotoStore("t");
    expect((await store.fetchOriginal(7))?.toString()).toBe("abc");
    expect(blob.get).toHaveBeenCalledWith("photos/7", { access: "public", token: "t" });
  });

  it("reports a missing blob as null", async () => {
    blob.get.mockResolvedValue(null);
    const store = new VercelBlobPhotoStore("t");
    expect(await store.fetchVariant(7, "Large")).toBeNull();
    expect(blob.get).toHaveBeenCalledWith("photos/7/Large", { access: "public", token: "t" });
  });

  it("writes at a fixed key, overwriting, with the content type", async () => {
    blob.put.mockResolvedValue({});
    const store = new VercelBlobPhotoStore("t");
    await store.putVariant(7, "Medium", Buffer.from("v"), "image/jpeg");
    expect(blob.put).toHaveBeenCalledWith(
      "photos/7/Medium",
      Buffer.from("v"),
      expect.objectContaining({
        access: "public",
        token: "t",
        contentType: "image/jpeg",
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
    );
  });

  it("deletes the original and every listed variant, across pages", async () => {
    blob.list
      .mockResolvedValueOnce({ blobs: [{ url: "https://x/photos/7/Large" }], hasMore: true, cursor: "c1" })
      .mockResolvedValueOnce({ blobs: [{ url: "https://x/photos/7/Medium" }], hasMore: false });
    blob.del.mockResolvedValue(undefined);
    const store = new VercelBlobPhotoStore("t");
    await store.deletePhoto(7);
    expect(blob.list).toHaveBeenNthCalledWith(1, { prefix: "photos/7/", cursor: undefined, token: "t" });
    expect(blob.list).toHaveBeenNthCalledWith(2, { prefix: "photos/7/", cursor: "c1", token: "t" });
    expect(blob.del).toHaveBeenCalledWith(
      ["photos/7", "https://x/photos/7/Large", "https://x/photos/7/Medium"],
      { token: "t" },
    );
  });
});

describe("InMemoryPhotoStore", () => {
  it("deletes only the given photo's original and variants", async () => {
    const store = new InMemoryPhotoStore();
    await store.putOriginal(1, Buffer.from("o1"), "image/png");
    await store.putVariant(1, "Medium", Buffer.from("m1"), "image/png");
    await store.putOriginal(10, Buffer.from("o10"), "image/png");
    await store.putVariant(10, "Medium", Buffer.from("m10"), "image/png");
    await store.deletePhoto(1);
    expect([...store.objects.keys()].sort()).toEqual(["photos/10", "photos/10/Medium"]);
  });
});
