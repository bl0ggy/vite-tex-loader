import type { Plugin, ResolvedConfig } from 'vite';

import child_process from "child_process";
import path from 'path';

export type ViteLoaderSvgTexOptions = {
    /**
     * Path to GhostScript lib (not executable)
     */
    LIBGS?: string;
}

export default function viteLoaderSvgTex(options: ViteLoaderSvgTexOptions = {}): Plugin {
    let config: ResolvedConfig;

    return {
        name: 'svg-text-loader',
        configResolved(_config) {
            config = _config;
        },
        async load(filename: string) {
            if(!filename.match(/.+\.svg\.tex$/)) {
                // We don't manage other files than *.svg.tex
                return;
            }

            const folder = path.dirname(filename);
            const file = path.basename(filename);
            const relativeFolder = folder.replace(path.normalize(config.root + "/"), '');
            const fileExtensionMatch = file.match(/^(.*)\.tex$/);
            if(!fileExtensionMatch) {
                console.error("Couldn't convert the file to SVG");
                return;
            }
            const fileWithoutTexExtension = fileExtensionMatch[1];
            const tmpDir = `${file}_tmp`; // Temporary directory to build latex files
            const svgDestDir = `${config.publicDir}/.auto-generated/${relativeFolder}`;
            const svgDest = `${svgDestDir}/${fileWithoutTexExtension}`;
            const svgUri = svgDest.replace(config.root + '/public', '');

            try {
                // Create the SVG file
                let libgs = "";
                if(options.LIBGS) {
                    libgs = `export LIBGS=${options.LIBGS} ; `;
                }
                child_process.execSync(`${libgs} pushd "${folder}" && mkdir -p "${tmpDir}" && mkdir -p "${svgDestDir}" && latex -output-directory="${tmpDir}" -output-format=dvi "${file}" && dvisvgm -o "${svgDest}" "${tmpDir}/${fileWithoutTexExtension}.dvi"`);
            } catch(e) {
                console.error("Couldn't convert the file to SVG");
                return;
            }
            try {
                // Remove the temporary folder
                child_process.execSync(`pushd "${folder}" && rm -r "${tmpDir}"`);
            } catch(e) {
                console.error("Couldn't convert the file to SVG");
                return;
            }

            return `export default "${svgUri}";`;
        }
    }
}
