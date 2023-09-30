# vite-tex-loader
Converts a `.tex` file to PDF or SVG and provides the URI.

# Getting started
## To install `vite-tex-loader`:
```bash
npm i -D vite-tex-loader
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
        const def: string
        export default def
    }
    declare module '*.tex?svg' {
        const def: {
            uri: string
            raw: string
        }
        export default def
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
    ```typescriptreact
    import { uri } from `image.tex`;

    export default function () {
        return <img src={uri} />
    }
    ```

Latex needs to generate temporary files which will be located `.vite-tex-loader`. The result file will then be moved to `public/.auto-generated/<subfolder>/<file>`.

For example if you have a file `src/assets/pdf.tex`, the result PDF file will be `public/.auto-generated/src/assets/file.pdf`.

# Known issues
- Only tested on Unix (Linux/MacOS).
- The host must have `latex` installed, `pdflatex` to generate PDF files and `dvisvgm` to generate SVG files, and they must all be in the PATH environment variable.
    - For the warning related to "PostScript specials", you must provide LIBGS option e.g. `texLoader({LIBGS: "/usr/local/share/ghostscript/9.55.0/lib/libgs.dylib.9.55"})`
- You have to create the type declatation for `*.tex` files yourself, it can't be imported from this package.
