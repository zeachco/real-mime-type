import { assertEquals } from "https://deno.land/std@0.140.0/testing/asserts.ts";
import { fromFile } from "./mod.ts";

const jpegFileBits = new Uint8Array(
  [
    0xFF,
    0xD8,
    0xFF,
    0xE0,
    0x00,
    0x10,
    0x4A,
    0x46,
    0x49,
    0x46,
    0x00,
    0x01,
  ],
);

const invalidFileBits = new Uint8Array(
  [
    0xFF,
    0xD8,
    0xFF,
    0xE0,
    0x46,
    0x00,
    0x01,
  ],
);

Deno.test("fromFile with image/jpeg", async () => {
  const mimeType = await fromFile(
    new File([jpegFileBits], "test.gif", {
      type: "image/png",
    }),
  );

  assertEquals(mimeType, "image/jpeg");
});

Deno.test("fromFile fallback", async () => {
  const mimeType = await fromFile(
    new File([invalidFileBits], "test.gif", {
      type: "image/png",
    }),
  );

  assertEquals(mimeType, "image/png");
});
