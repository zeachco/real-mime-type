# real-mime-type

MIME types (IANA media types) can be wrong when the user changes the file extension, this package reads the first bytes of the file to ensure they fit the expectations and reverts to default browser mime types when unsupported

## Generate lib

`deno task dev` for watch mode

or

`deno task build` for ci


## Demo

https://stackblitz.com/edit/react-ts-eqqh3x?file=App.tsx,UploadValidator.tsx

## Contributions to package it properly are welcome
