/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
    testEnvironment: 'node',
    transform: {
        '^.+.ts?$': ['ts-jest', {
            tsConfig: 'tsconfig.test.json',
        }],
    },
    preset: 'ts-jest',
};
