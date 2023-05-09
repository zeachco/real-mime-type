import {
  DOMParser,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { mime } from "https://raw.githubusercontent.com/Tyrenn/mimetypes/main/mod.ts";
import { transpile } from "https://deno.land/x/emit/mod.ts";
import { bundle } from "https://deno.land/x/emit@0.22.0/mod.ts";
import type { DBItem } from "./types.ts";

const wikiSource = "https://en.wikipedia.org/wiki/List_of_file_signatures";
const dbTarget = "./src/db.json";

// fetch html from wikipedia
const document = await fetchHTMLFromUrl(wikiSource);

if (!document) throw new Error("Could not fetch html from wikipedia");

// get the table with the file signatures
const data = await getDB(document);
console.log(`generated ${data.length} items in ${dbTarget}`);

await Deno.writeTextFile(dbTarget, JSON.stringify(data));

const url = new URL("./lib.ts", import.meta.url);
const result = await transpile(url);
const code = result[url.href];

await Deno.writeTextFile("./dist/index.js", code);
await Deno.rename("./src/db.json", "./dist/db.json");

const bundleUrl = new URL("../dist/index.js", import.meta.url);
const compiled = await bundle(bundleUrl);

const mainUrl = new URL("../index.js", import.meta.url);
await Deno.writeTextFile(mainUrl, compiled.code);

async function fetchHTMLFromUrl(url: string) {
  const res = await fetch(url);
  const html = await res.text();
  const document = new DOMParser().parseFromString(html, "text/html");
  return document;
}

type HTMLTableRowElement = any;
type HTMLTableDataCellElement = any;
type HTMLCodeElement = any;

function getDB(document: HTMLDocument) {
  const mimeTypes = new Map<string, DBItem>();
  const data:DBItem[] = [];

  const trs: HTMLTableRowElement[] = Array.from(
    document.querySelector(".wikitable")!.querySelectorAll("tr")
  );

  trs.forEach((tr, index) => {
    try {
      const td: HTMLTableDataCellElement = tr.querySelectorAll("td");
      const [codesCol, _binaryCol, offsetCol, extensionCol] = td;

      if (!codesCol) return;

      // replace all hex codes ? with dots and remove non-hex chars to get rid
      // of html artifacts such as line breaks, spaces and whitespace chars
      const hexCodesEls: HTMLCodeElement[] = Array.from(
        codesCol.querySelectorAll("code")
      );

      const hexCodes = hexCodesEls.map((col) =>
        col.innerText.replace("?", ".").replace(/[^A-Z0-9\.]/gi, "")
      );

      // get offset to start reading the binary file
      const offset = +offsetCol?.innerText?.trim();

      // get all extensions (will be used to get mime types)
      const exts = Array.from(extensionCol?.childNodes || [])
        .filter((node: any) => node.nodeType === 3)
        .map((textFragment: any) => textFragment.textContent.trim())
        .filter(Boolean);

      // get mime types from extensions
      const mimeType: string =
        exts.map((hexCode) => mime.getType(hexCode)!).filter(Boolean)[0] || "";

      if (hexCodes.length && isFinite(offset) && mimeType) {
        hexCodes.forEach((hexCode) => {
          data.push({
            mimeType,
            exts,
            offset,
            hexCode,
          });
        });
      } else {
        console.warn(
          `Dropping line ${index} because it could not be parsed ${hexCodes} ${mimeType}`
        );
      }
    } catch (error) {
      console.log(`line ${index} failed:`, error);
    }
  });

  data.sort((a, b) => b.hexCode.length - a.hexCode.length);

  return data;
}
