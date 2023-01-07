# vite-loader-svg-tex
Loads a `.svg.tex` file and converts it to SVG.

# Getting started
## To install `vite-loader-svg-tex`:
```bash
npm i -D vite-loader-svg-tex
```

## To use `vite-loader-svg-tex`:
- Update your `vite.config.js`:
    ```typescript
    import svgTexLoader from 'vite-loader-svg-tex';

    export default defineConfig({
        plugins: [svgTexLoader()],
    });
    ```
- Import the `*.svg.tex` file and use it (example JSX/TSX):
    ```typescriptreact
    import svg from `image.svg.tex`;

    export default function () {
        return <img src={svg} />
    }
    ```

The SVG files is created in the public folder `public/.auto-generated/<subfolder>/<scg-file>`.
For example if you have a file in `src/assets/banner.svg.tex`, the SVG file will be created in `public/.auto-generated/assets/banner.svg`.

# Known issues
- Only works on Unix (Linux/MacOS).
- The host must have `latex` and `dvisvgm` installed and in the PATH environment variable.
    - For the warning related to "PostScript specials", you must provide LIBGS option
- Creates temporary files in the folder containing the `.svg.tex` file. These files are removed automagically, but may retain in case of failure.
- This package has been made by a man who doesn't have a deep knowledge of Vite, any suggestion/pull-request is welcome.
