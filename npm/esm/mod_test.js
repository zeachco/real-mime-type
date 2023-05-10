var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "./_dnt.test_polyfills.js";
import * as dntShim from "./_dnt.test_shims.js";
import { assertEquals } from "./deps/deno.land/std@0.140.0/testing/asserts.js";
import { fromFile } from "./mod.js";
const jpegFileBits = new Uint8Array([
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
]);
const invalidFileBits = new Uint8Array([
    0xFF,
    0xD8,
    0xFF,
    0xE0,
    0x46,
    0x00,
    0x01,
]);
dntShim.Deno.test("fromFile with image/jpeg", () => __awaiter(void 0, void 0, void 0, function* () {
    const mimeType = yield fromFile(new File([jpegFileBits], "test.gif", {
        type: "image/png",
    }));
    assertEquals(mimeType, "image/jpeg");
}));
dntShim.Deno.test("fromFile fallback", () => __awaiter(void 0, void 0, void 0, function* () {
    const mimeType = yield fromFile(new File([invalidFileBits], "test.gif", {
        type: "image/png",
    }));
    assertEquals(mimeType, "image/png");
}));
//# sourceMappingURL=mod_test.js.map