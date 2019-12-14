'use strict'
export function escapeKey(key:string):string {
  return key.replace(/(\.|\\)/g, '\\$1')
}

export function unescapeKey(key:string):string {
  return key.replace(/\\(\.|\\)/g, '$1')
}

function isEscaped(str:string, index:number):boolean {
  var count = 0
  while(index > 0 && str.charAt(index - 1) == '\\') {
    ++count
    --index
  }
  return count % 2 == 1
}
export function indexOfPeriod(ns:string, start?:number) {
  var index = ns.indexOf('.', start)
  while (index >= 0 && isEscaped(ns, index)) {
    index = ns.indexOf('.', index + 1)
  }
  return index
}

export function lastIndexOfPeriod(ns:string, start?:number) {
  var index = ns.lastIndexOf('.', start)
  while (index >= 0 && isEscaped(ns, index)) {
    index = ns.lastIndexOf('.', index - 1)
  }
  return index
}
