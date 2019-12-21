'use strict';

const {
    run,
    series,
    parallel,
} = require('madrun');

module.exports = {
    "test": () => 'tape test/*.js',
    "lint": () => 'eslint lib test',
    "fix:lint": () => run('lint', '--fix'),
    "watch:test": () => run('watcher', '"npm test"'),
    "watcher": () => 'nodemon -w lib -w test -x',
    "coverage": () => 'nyc npm test',
    "report": () => 'nyc report --reporter=text-lcov | coveralls',
    "wisdom": () => run('build'),
    "6to5": () => 'buble lib -o legacy',
    "build": () => run(['6to5', 'legacy']),
    "prebuild": () => 'rimraf legacy',
    "legacy": () => 'echo "module.exports = require(\'./fs-copy-file-sync\');" > legacy/index.js'
};

