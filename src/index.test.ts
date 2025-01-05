import { readdirSync, statSync } from 'node:fs';
import { convert } from '.';
import { readFile, readJson } from 'nodeeasyfileio';

describe('converter', () => {
    const testFiles = readdirSync('./testdata/')
        .map(f => './testdata/' + f)
        .filter(f => statSync(f).isFile() && f.endsWith('.xml'));
    const testAndExpectPairs = testFiles.map(f => {
        return {
            src: f,
            expected: f.replace('.xml', '.json'),
        };
    });
    it('should convert xml to json', async () => {
        const Promises = testAndExpectPairs.map(async ({ src, expected }) => {
            const xml = readFile(src);
            const expectedJson = readJson(expected);
            const converted = await convert(xml);
            console.log(`pair: ${src} -> ${expected}`);
            expect(converted).toStrictEqual(expectedJson);
        });
        await Promise.all(Promises);
    });
});
