import db from "./db.js";
export function fromFiles(files) {
    return Promise.all(Array.from(files).map(fromFile));
}
export function fromFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            var _a;
            const arrayBuffer = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            if (!arrayBuffer || typeof arrayBuffer === "string") {
                throw new Error("Could not read file");
            }
            const mimeType = getMimeTypes(arrayBuffer, file.type);
            resolve(mimeType);
        };
        reader.readAsArrayBuffer(file);
    });
}
function getMimeTypes(arrayBuffer, fallback = "unknown") {
    for (const k in db) {
        const { hexCode, offset, mimeType } = db[k];
        try {
            const sequence = getHexFromRange(arrayBuffer, offset, hexCode.length);
            const regex = new RegExp(hexCode, "i");
            if (regex.test(sequence))
                return mimeType;
        }
        catch (err) {
            console.warn(`could not match magic number for ${mimeType}`, err);
        }
    }
    console.warn(`could not match magic number, using fallback ${fallback}`);
    return fallback;
}
function getHexFromRange(arrayBuffer, start, length) {
    const uint8Array = new Uint8Array(arrayBuffer);
    const hexValues = [];
    const from = Math.min(start, uint8Array.length - length);
    for (let i = from; i <= from + length; i++) {
        const hexValue = uint8Array[i].toString(16).padStart(2, "0");
        hexValues.push(hexValue);
    }
    return hexValues.filter(Boolean).join("");
}
//# sourceMappingURL=mod.js.map