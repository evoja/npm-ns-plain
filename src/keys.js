'use strict'
export function escapeKey(key) {
  return key.replace(/(\.|\\)/g, '\\$1')
}

export function unescapeKey(key) {
  return key.replace(/\\(\.|\\)/g, '$1')
}

function isEscaped(str, index) {
  var count = 0
  while(index > 0 && str.charAt(index - 1) == '\\') {
    ++count
    --index
  }
  return count % 2 == 1
}
export function indexOfPeriod(ns, start) {
  var index = ns.indexOf('.', start)
  while (index >= 0 && isEscaped(ns, index)) {
    index = ns.indexOf('.', index + 1)
  }
  return index
}

export function lastIndexOfPeriod(ns, start) {
  var index = ns.lastIndexOf('.', start)
  while (index >= 0 && isEscaped(ns, index)) {
    index = ns.lastIndexOf('.', index - 1)
  }
  return index
}
