import type { DBItem } from "./types.ts";
import db from "./db.json" assert { type: "json" };

if (typeof global !== "undefined") {
  (global as any).fromFiles = fromFiles;
}

try {
  if (module) {
    module.exports = fromFiles;
  }
} catch (error) {}

function fromFiles(files: File[]) {
  return Promise.all(
    Array.from(files).map((file) => {
      return new Promise((resolve) => {
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
    })
  );
}

function getMimeTypes(arrayBuffer: ArrayBuffer, fallback = "unknown") {
  for (const k in db) {
    const { hexCode, offset, mimeType } = db[k] as DBItem;
    const sequence = getHexFromRange(arrayBuffer, offset, hexCode.length);
    const regex = new RegExp(hexCode, "i");
    if (regex.test(sequence)) return mimeType;
  }

  console.warn(`could not match magic number, using fallback ${fallback}`);
  return fallback;
}

function getHexFromRange(
  arrayBuffer: ArrayBuffer,
  start: number,
  length: number
) {
  const uint8Array = new Uint8Array(arrayBuffer);
  const hexValues = [] as string[];

  for (let i = start; i <= start + length; i++) {
    const hexValue = uint8Array[i].toString(16).padStart(2, "0");
    hexValues.push(hexValue);
  }

  return hexValues.filter(Boolean).join("");
}
