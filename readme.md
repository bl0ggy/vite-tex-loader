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
  import pdfUri from 'pdf.tex?pdf-uri'; // Give the URI of the PDF in the public folder
  import image1Uri from 'image1.tex?svg'; // Give the URI of the SVG in the public folder
  import { uri as image2Uri } from 'image2.tex?svg'; // Give the URI of the SVG in the public folder
  import { raw as image2Raw } from 'image2.tex?svg'; // Give the raw content of the SVG file

  export default function () {
      return (
          <>
              <a href={pdfUri}>PDF file</a>
              <img src={image1Uri} />
              <img src={image2Uri} />
              {/* This loader doesn't create a React Node object, only raw text is provided */}
              <div dangerouslySetInnerHTML={{ __html: image2Raw }} />
          </>
      );
  }
  ```

Latex needs to generate temporary files which will be located in
`.vite-tex-loader`. The result file will then be moved to
`public/.auto-generated/<subfolder>/<file>`.

For example if you have a file `src/assets/pdf.tex`, the result PDF file will be
`public/.auto-generated/src/assets/file.pdf`.

There are several options on the loader that you can add to vite.config.js:

- `LIBGS`: This can be set either as an option or as an environment variable. It
  must contain the path to ghostscript library `libgs.so*` or `libgs.dylib*`
- `svgLatexCliOptions`: Contains all CLI options you want to pass to `latex`
  when generating the SVG file
- `svgDvisvgmCliOptions`: Contains all CLI options you want to pass to `dvisvgm`
  when generating the SVG file
- `pdfPdfLatexCliOptions`: Contains all CLI options you want to pass to
  `pdflatex` when generating the PDF file

There is also a URI parameter that you can provide at each SVG file you want to
generate:

- `idPrefix`: The prefix to add before all auto generated ids in the SVG. This
  is useful to avoid conflicts between SVGs in a single web page.

This URI parameter is just a & separated key/value pair, identical to what web
pages use. Here is an example on how to use this URI parameter:

```tsx
import svg from 'image2.tex?svg&idPrefix=test_';
```

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
  - If you get the warning "processing of PostScript specials is disabled
    (Ghostscript not found)", you must provide LIBGS either as an environment
    variable or as an option in `vite.config.js` e.g.
    `texLoader({LIBGS: "/usr/local/share/ghostscript/9.55.0/lib/libgs.dylib.9.55"})`.
    The loader option has priority over the environment variable.

    If both the environment variable and the options are **not** set,
    `vite-tex-loader` will try to find the library on your system, but it's not
    guaranteed to succeed.
- You have to create the type declaration for `*.tex` files yourself, it can't
  be imported from this package. If you know how to do that, please open an
  issue or PR!
