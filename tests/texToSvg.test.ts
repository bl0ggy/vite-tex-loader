import { beforeEach, describe, expect, test } from '@jest/globals';
import fs from 'node:fs';
import { load } from '../src/internal.ts';

describe('SVG tests', () => {
    beforeEach(() => {
        fs.rmSync('./tests/.vite-tex-loader', {
            recursive: true,
            force: true,
        });
        fs.rmSync('./tests/public/.auto-generated', {
            recursive: true,
            force: true,
        });
    });

    test('Converts triangle to SVG', () => {
        const result = load(
            {},
            { root: './tests', publicDir: './tests/public' },
            './examples/triangle.tex?svg',
        );
        expect(result).toEqual(
            `export const uri = "/.auto-generated/./examples/triangle.svg"; export const raw = \`<?xml version='1.0' encoding='UTF-8'?>
<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='30.340256pt' height='30.340199pt' viewBox='-72.000181 -72.000175 30.340256 30.340199'>
<g id='page1'>
<path d='M-42.6562-42.656251H-71.003906V-71.0039Z' stroke='#f00' fill='none' stroke-width='1.99255' stroke-miterlimit='10'/>
</g>
</svg>\`; export default uri;`,
        );
        expect(fs.readdirSync('./tests/public/.auto-generated/./examples'))
            .toContain(
                'triangle.svg',
            );
    });

    test('Add prefix to SVG ids', () => {
        const result = load(
            {},
            { root: './tests', publicDir: './tests/public' },
            './examples/triangle.tex?svg&idPrefix=test_',
        );
        expect(result).toEqual(
            `export const uri = "/.auto-generated/./examples/triangle.svg"; export const raw = \`<?xml version='1.0' encoding='UTF-8'?>
<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='30.340256pt' height='30.340199pt' viewBox='-72.000181 -72.000175 30.340256 30.340199'>
<g id='test_page1'>
<path d='M-42.6562-42.656251H-71.003906V-71.0039Z' stroke='#f00' fill='none' stroke-width='1.99255' stroke-miterlimit='10'/>
</g>
</svg>\`; export default uri;`,
        );
        expect(fs.readdirSync('./tests/public/.auto-generated/./examples'))
            .toContain(
                'triangle.svg',
            );
    });

    test('Fails converting fail to SVG', () => {
        expect(() =>
            load(
                {},
                { root: './tests', publicDir: './tests/public' },
                './tests/fail.tex?svg',
            )
        ).toThrow();
    });
});
