import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";
import {
  DOMParser,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { mime } from "https://raw.githubusercontent.com/Tyrenn/mimetypes/main/mod.ts";
import type { DBItem } from "./types.ts";

await scrapeDB();

// Create npm pkg
await emptyDir("./npm");

const promises = [
  Deno.copyFile("./README.md", "./npm/README.md"),
  Deno.copyFile("./LICENSE", "./npm/LICENSE"),
  build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    shims: {
      deno: "dev",
      blob: "dev",
      domException: "dev",
    },
    compilerOptions: {
      lib: ["esnext", "dom", "dom.iterable"],
      sourceMap: true,
      target: "ES2015",
    },
    package: {
      name: "@zeachco/real-mime-types",
      version: Deno.args[0] || "0.0.0",
      description: "A database of real mime types",
      license: "GPL-3.0",
    },
  }),
];

Promise.all(promises);

async function fetchHTMLFromUrl(url: string) {
  const res = await fetch(url);
  const html = await res.text();
  const document = new DOMParser().parseFromString(html, "text/html");
  return document;
}

function getDB(document: HTMLDocument) {
  const data: DBItem[] = [];

  const trs: NodeListOf<HTMLTableRowElement> = document.querySelector(
    ".wikitable",
  )!.querySelectorAll("tr") as any;

  trs.forEach((tr, index) => {
    try {
      const tds = tr.querySelectorAll("td");
      const [codesCol, _binaryCol, offsetCol, extensionCol] = tds;

      if (!codesCol) return;

      // replace all hex codes ? with dots and remove non-hex chars to get rid
      // of html artifacts such as line breaks, spaces and whitespace chars
      const hexCodesEls: HTMLElement[] = Array.from(
        codesCol.querySelectorAll("code"),
      );

      const hexCodes = hexCodesEls.map((col) =>
        col.innerText.replace("?", ".").replace(/[^A-Z0-9\.]/gi, "")
      );

      // get offset to start reading the binary file
      const offset = +offsetCol?.innerText?.trim();

      // get all extensions (will be used to get mime types)
      const exts = Array.from(extensionCol?.childNodes || [])
        .filter((node) => node.nodeType === 3)
        .map((textFragment: any) => textFragment.textContent.trim())
        .filter(Boolean);

      // get mime types from extensions
      const mimeType: string = exts.map((hexCode) =>
        mime.getType(hexCode)!
      ).filter(Boolean)[0] || "";

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
          `Dropping line ${index} because it could not be parsed ${hexCodes} ${mimeType}`,
        );
      }
    } catch (error) {
      console.log(`line ${index} failed:`, error);
    }
  });

  data.sort((a, b) => b.hexCode.length - a.hexCode.length);

  return data;
}

async function scrapeDB() {
  const wikiSource = "https://en.wikipedia.org/wiki/List_of_file_signatures";
  const dbTarget = "./db.json";

  // fetch html from wikipedia
  const document = await fetchHTMLFromUrl(wikiSource);

  if (!document) throw new Error("Could not fetch html from wikipedia");

  // get the table with the file signatures
  const data = await getDB(document);
  console.log(`generated ${data.length} items in ${dbTarget}`);

  await Deno.writeTextFile(dbTarget, JSON.stringify(data));
}
