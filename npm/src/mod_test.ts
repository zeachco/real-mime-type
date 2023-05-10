import "./_dnt.test_polyfills.js";
import * as dntShim from "./_dnt.test_shims.js";
import { assertEquals } from "./deps/deno.land/std@0.140.0/testing/asserts.js";
import { fromFile } from "./mod.js";

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

dntShim.Deno.test("fromFile with image/jpeg", async () => {
  const mimeType = await fromFile(
    new File([jpegFileBits], "test.gif", {
      type: "image/png",
    }),
  );

  assertEquals(mimeType, "image/jpeg");
});

dntShim.Deno.test("fromFile fallback", async () => {
  const mimeType = await fromFile(
    new File([invalidFileBits], "test.gif", {
      type: "image/png",
    }),
  );

  assertEquals(mimeType, "image/png");
});
