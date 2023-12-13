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

Latex needs to generate temporary files which will be located `.vite-tex-loader`. The result file will then be moved to `public/.auto-generated/<subfolder>/<file>`.

For example if you have a file `src/assets/pdf.tex`, the result PDF file will be `public/.auto-generated/src/assets/file.pdf`.

# Known issues
- Only tested on Unix (Linux/MacOS).
- The host must have `latex` installed, `pdflatex` to generate PDF files and `dvisvgm` to generate SVG files, and they must all be in the PATH environment variable.
    - For the warning related to "PostScript specials", you must provide LIBGS option e.g. `texLoader({LIBGS: "/usr/local/share/ghostscript/9.55.0/lib/libgs.dylib.9.55"})`
- You have to create the type declatation for `*.tex` files yourself, it can't be imported from this package.
