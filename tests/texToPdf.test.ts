import { expect, test } from '@jest/globals';
import fs from 'fs';
import { load } from '../src/internal.ts';

test('Converts triangle to PDF', () => {
    const result = load(
        {},
        { root: './tests', publicDir: './tests/public' },
        './examples/triangle.tex?pdf-uri',
    );
    expect(result).toEqual(
        'export default "/.auto-generated/./examples/triangle.pdf";',
    );
    expect(fs.readdirSync('./tests/public/.auto-generated/./examples'))
        .toContain(
            'triangle.pdf',
        );
});
test('Fails converting fail to PDF', () => {
    expect(() =>
        load(
            {},
            { root: './tests', publicDir: './tests/public' },
            './tests/fail.tex?pdf-uri',
        )
    ).toThrow();
});
