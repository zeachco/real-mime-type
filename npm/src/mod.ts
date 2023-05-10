import type { DBItem } from "./types.js";
import db from "./db.js";

type File = any;
type FileList = File[];

export function fromFiles(files: FileList) {
  return Promise.all(Array.from(files).map(fromFile));
}

export function fromFile(file: File) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer = e.target?.result;
      if (!arrayBuffer || typeof arrayBuffer === "string") {
        throw new Error("Could not read file");
      }
      const mimeType = getMimeTypes(arrayBuffer, file.type);
      resolve(mimeType);
    };
    reader.readAsArrayBuffer(file);
  });
}

function getMimeTypes(arrayBuffer: ArrayBuffer, fallback = "unknown") {
  for (const k in db) {
    const { hexCode, offset, mimeType } = db[k] as DBItem;
    try {
      const sequence = getHexFromRange(arrayBuffer, offset, hexCode.length);
      const regex = new RegExp(hexCode, "i");
      if (regex.test(sequence)) return mimeType;
    } catch (err) {
      console.warn(`could not match magic number for ${mimeType}`, err);
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

  const from = Math.min(start, uint8Array.length - length);

  for (let i = from; i <= from + length; i++) {
    const hexValue = uint8Array[i].toString(16).padStart(2, "0");
    hexValues.push(hexValue);
  }

  return hexValues.filter(Boolean).join("");
}
