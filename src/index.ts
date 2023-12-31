import type { Plugin, ResolvedConfig } from 'vite';
import { handleTexToPdf, handleTexToSvg, viteTexLoaderOptions } from './internal.js';

export default function viteTexLoader(options: viteTexLoaderOptions = {}) : Plugin {
    let config: ResolvedConfig;

    return {
        name: 'vite-tex-loader',
        configResolved(_config) {
            config = _config;
        },
        async load(filePath: string) {
            if(filePath.match(/.+\.tex\?svg$/)) {
                return handleTexToSvg(options, config, filePath.replace(/\?svg$/, ''));
            }
            if(filePath.match(/.+\.tex\?pdf-uri$/)) {
                return handleTexToPdf(options, config, filePath.replace(/\?pdf-uri$/, ''));
            }
            // We don't support the file/module requested
            return undefined;
        },
    };
}
