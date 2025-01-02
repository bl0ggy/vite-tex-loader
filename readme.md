# vite-tex-loader

Converts a `.tex` file to PDF or SVG and provides the URI or raw SVG string.

# Motivations

I do not like to use raw pictures (e.g.: .png, .jpg) on websites, and mostly I
don't like to save binary files on my git repos!

I like to use .svg files, so that I can keep track of the changes.

Tikz is the best tool to create diagrams programmatically, see:

- https://github.com/pgf-tikz/pgf
- https://tikz.dev/
- https://tikz.net/

# Getting started

## To install `vite-tex-loader`:

```bash
# This package is not needed in production environment
pnpm i -D vite-tex-loader
```

## To use `vite-tex-loader`:

- Update your `vite.config.js`:
  ```typescript
  import viteTexLoader from 'vite-tex-loader';

  export default defineConfig({
      plugins: [viteTexLoader()],
  });
  ```
- Create file `typings/tex.d.ts` containing:
  ```typescript
  declare module '*.tex?pdf-uri' {
      export const uri: string;
      export default uri;
  }
  declare module '*.tex?svg' {
      export const uri: string;
      export const raw: string;
      export default uri;
  }
  ```
- Add typings folder to your `tsconfig.json`:
  ```json
  {
      "include": [
          "typings"
      ]
  }
  ```
- Import the `*.tex` file and use it (example JSX/TSX):
  ```tsx
  import pdfUri from `pdf.tex?pdf-uri`;
  import image1Uri from `image1.tex?svg`;
  import { uri as image2Uri } from `image2.tex?svg`;

  export default function () {
      return (
          <>
              <a href={pdfUri}>PDF file</a>
              <img src={image1Uri} />
              <img src={image2Uri} />
          </>
      );
  }
  ```

Latex needs to generate temporary files which will be located in
`.vite-tex-loader`. The result file will then be moved to
`public/.auto-generated/<subfolder>/<file>`.

For example if you have a file `src/assets/pdf.tex`, the result PDF file will be
`public/.auto-generated/src/assets/file.pdf`.

# Tests and example

By running the tests `pnpm run test` you should find the final files in
`./tests/public/.auto-generated/`.

The generated `./tests/.../examples/triangle.svg` file should be equivalent to
the one in `./examples`:

![Triangle example](examples/triangle.svg?raw=true "Triangle example")

# Known issues

- Only tested on Unix (Linux/macOS).
- The host must have `latex` installed, `pdflatex` to generate PDF files and
  `dvisvgm` to generate SVG files, and they must all be in the PATH environment
  variable.
  - For the warning related to "PostScript specials", you must provide LIBGS
    option in `vite.config.js` e.g.
    `texLoader({LIBGS: "/usr/local/share/ghostscript/9.55.0/lib/libgs.dylib.9.55"})`.

    `vite-tex-loader` will try to find the library on your system but it's not
    guaranteed to succeed.
- You have to create the type declaration for `*.tex` files yourself, it can't
  be imported from this package. If you know how to do that, please open an
  issue or PR!
