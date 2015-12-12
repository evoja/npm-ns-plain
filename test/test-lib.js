'use strict'
try {
  require('./**/!(*-test).js',  {mode: 'expand'})
} catch (e) {
  if (typeof window !== 'undefined') {
    throw e
  } else {
    // Do nothing. Looks like we just run in normal mode instead of browserify
  }
}
exports.require = function(path) {
  return require('./' + path)
}
