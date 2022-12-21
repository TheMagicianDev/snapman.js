import { Config } from 'jest';
import fs from 'fs';

const swcrc = JSON.parse(
  fs.readFileSync(`${__dirname}/swcrc.cjs.json`, 'utf-8'),
);

const config: Config = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        ...swcrc,
      },
    ],
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1',
  },
  testPathIgnorePatterns: ['test/__fixtures__', 'node_modules', 'dist'],
};

export default config;
