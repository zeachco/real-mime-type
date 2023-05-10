"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./_dnt.test_polyfills.js");
const dntShim = __importStar(require("./_dnt.test_shims.js"));
const asserts_js_1 = require("./deps/deno.land/std@0.140.0/testing/asserts.js");
const mod_js_1 = require("./mod.js");
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
    const mimeType = yield (0, mod_js_1.fromFile)(new File([jpegFileBits], "test.gif", {
        type: "image/png",
    }));
    (0, asserts_js_1.assertEquals)(mimeType, "image/jpeg");
}));
dntShim.Deno.test("fromFile fallback", () => __awaiter(void 0, void 0, void 0, function* () {
    const mimeType = yield (0, mod_js_1.fromFile)(new File([invalidFileBits], "test.gif", {
        type: "image/png",
    }));
    (0, asserts_js_1.assertEquals)(mimeType, "image/png");
}));
//# sourceMappingURL=mod_test.js.map