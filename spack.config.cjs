const { config } = require('@swc/core/spack');

const path = require('path');

const fs = require('fs');

const p = (relativePath) => path.resolve(__dirname, relativePath);

const swcrc = JSON.parse(
  fs.readFileSync(p('swcrc.esm.json'), { encoding: 'utf8' }),
);

module.exports = config({
  entry: {
    index: p('src/index.ts'),
  },
  output: {
    name: 'SnapmanJs.js',
    path: p('dist/bundle'),
  },
  mode: 'production',
  target: 'browser',
  options: {
    ...swcrc,
    module: undefined,
  },
  // externalModules: ['node_modules\/(?!node-fetch)'],
});
