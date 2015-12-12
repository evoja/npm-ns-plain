'use strict';
var nodeunit = require('nodeunit')
var r = require('nodeunit/lib/reporters/browser.js')
window.nodeunit = nodeunit
var files = require('./tests/**/*-test.js',  {mode: 'hash'})
console.log('Test files:', files)
nodeunit.reporters.browser = r
nodeunit.reporters.browser.run(files)
