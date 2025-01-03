import type { Plugin, ResolvedConfig } from 'vite';
import { load, viteTexLoaderOptions } from './internal.js';

export default function viteTexLoader(
    options: viteTexLoaderOptions = {},
): Plugin {
    let config: ResolvedConfig;

    return {
        name: 'vite-tex-loader',
        configResolved(_config) {
            config = _config;
        },
        load(filePath: string) {
            return load(options, config, filePath);
        },
    };
}
