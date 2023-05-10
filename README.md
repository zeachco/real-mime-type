# real-mime-type

MIME types (IANA media types) can be wrong when the user changes the file
extension, this package reads the first bytes of the file to ensure they fit the
expectations and reverts to default browser mime types when unsupported

## targets

This package is built using Deno but targets Deno, NPM and ESM

## Generate lib

`deno task dev` for watch mode

or

`deno task build` for ci

## Demo

https://stackblitz.com/edit/react-ts-eqqh3x?file=App.tsx,UploadValidator.tsx

## NPM Package

[@zeachco/real-mime-types](https://www.npmjs.com/package/@zeachco/real-mime-types)

Publish is public (`npm publish --access public`)

## Contributions to package it properly are welcome
