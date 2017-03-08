var eslintParser = require('./eslint-parser.js'),
    eslintFixer = require('./eslint-fixer.js'),
    csv = require('csv-streamify'),
    JSONStream = require('JSONStream');

// TODO: find a less verbose way to parse eslint errors
var csvToJson = csv({objectMode: true});

process.stdin
.pipe(csvToJson)
.pipe(eslintParser())
.pipe(eslintFixer())
.pipe(process.stdout);

process.stdout.on('error', process.exit);
