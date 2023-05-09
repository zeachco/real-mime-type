import type { DBItem } from "./types.ts";
import db from "./db.json" assert { type: "json" };

if (typeof global !== "undefined") {
  (global as any).fromFiles = fromFiles;
}

if (module) {
  module.exports = fromFiles;
}

function fromFiles(files: File[]) {
  return new Promise((resolve) => {
    return Array.from(files).map((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result;
        if (!arrayBuffer || typeof arrayBuffer === "string") {
          throw new Error("Could not read file");
        }
        const mimeType = getMimeTypes(arrayBuffer, file.type);
        resolve(mimeType);
      };
      reader.readAsArrayBuffer(file);
    });
  });
}

function getMimeTypes(arrayBuffer: ArrayBuffer, fallback = "unknown") {
  for (const type in db) {
    const { hexCodes, offset, mimeTypes } = db[type] as DBItem;
    for (const hexCode of hexCodes) {
      const sequence = getHexFromRange(arrayBuffer, offset, hexCode.length);
      const regex = new RegExp(hexCode, "i");
      if (regex.test(sequence)) {
        return mimeTypes[0] || fallback;
      }
    }
  }

  console.warn(`could not match magic number, using fallback ${fallback}`);
  return fallback;
}

function getHexFromRange(
  arrayBuffer: ArrayBuffer,
  start: number,
  length: number,
) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const hexValues = [] as string[];

  for (let i = start; i <= start + length; i++) {
    const hexValue = uint8Array[i].toString(16).padStart(2, "0");
    hexValues.push(hexValue);
  }

  return hexValues.join("");
}
