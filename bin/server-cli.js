#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    program = require('commander'),
    server = require('./server'),
    pkg = require('../package.json');

var basePath = process.cwd(),
    baseName,
    filePath,
    themePath = __dirname + '/../node_modules/reveal.js/css/theme',
    theme = 'black';

program
    .version(pkg.version)
    .usage('<slides.md> [options]')
    .option('-p, --port [port]', 'Port')
    .option('-t, --theme [theme]', 'Theme')
    .option('-r, --print [filename]', 'Print')
    .option('-s, --separator [separator]', 'Slide separator')
    .option('-v, --verticalSeparator [vertical separator]', 'Vertical slide separator')
    .parse(process.argv);

if(program.args.length > 2) {
    program.help();
}

var pathArg = program.args[0];

// TODO: fix user can have own demo file/directory
if(pathArg === 'demo') {

    basePath = __dirname + '/../demo';

} else if(pathArg) {

    filePath = path.resolve(pathArg);

    if(fs.existsSync(filePath)) {

        var stat = fs.statSync(filePath);

        if(stat.isFile()) {

            basePath = path.dirname(filePath);
            baseName = path.basename(filePath);

        } else if(stat.isDirectory()) {

            basePath = filePath;

        }

    } else {

        basePath = baseName = pathArg;

    }
}

theme = glob.sync('*.css', {
    cwd: themePath
}).map(function(themePath) {
    return path.basename(themePath).replace(path.extname(themePath), '');
}).indexOf(program.theme) !== -1 ? program.theme : theme;

// load custom reveal.js options from reveal.json
var revealOptions = {};
var manifestPath = path.join(basePath, 'reveal.json');
if (fs.existsSync(manifestPath) && fs.statSync(manifestPath).isFile(manifestPath)) {
  try {
    var options = require(manifestPath);
    if (typeof options === "object") {
      revealOptions = options;
    }
  } catch (err) {
    console.log(err);
  }
}

// overide default theme from manifest options
if (!program.theme && revealOptions.theme) {
  theme = revealOptions.theme;
}

server.start({
  basePath: basePath,
  initialMarkdownPath: baseName,
  port: program.port,
  theme: theme,
  separator: program.separator,
  verticalSeparator: program.verticalSeparator,
  printFile: program.print,
  revealOptions: revealOptions
});
