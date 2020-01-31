'use strict'
import {unescapeKey, indexOfPeriod, lastIndexOfPeriod} from './keys'
declare const global:typeof globalThis

type NsVal = NsContext|undefined|null|boolean|number|string|symbol|bigint|Function
type NsContext = NsVal[] | {[key in string|number|symbol]:NsVal} | undefined

let mockIsBrowser:undefined|boolean = undefined

function isBrowser():boolean|undefined {
  return typeof window !== 'undefined' || mockIsBrowser
}

function getGlobal():undefined|NsContext {
  return typeof window !== 'undefined' ? window as any : global as any
}

function throwIfNotContextNorBrowser(context:unknown):void {
  if (!isBrowser() && !context) {
    throw new Error('Must run in browser or have non-null context');
  }
}

function rawNamespace(name:string, context:undefined|NsContext, doNotCreate?:boolean):NsVal {
  throwIfNotContextNorBrowser(context)
  let prevIndex = 0;
  let nextIndex = indexOfPeriod(name, 0)
  let parent:NsVal = context || getGlobal()
  let walkedPath = ''

  if (!parent) {
    throw Error('Context is not defined and there isn\'t `window` nor `global` objects to set default context')
  }

  do
  {
    nextIndex = indexOfPeriod(name, prevIndex)
    const key = unescapeKey(
      nextIndex >= 0
      ? name.substring(prevIndex, nextIndex)
      : name.substring(prevIndex)
    )

    if (!key) {
      throw new Error('Deny empty path piece after "' + walkedPath + '"')
    }

    if (!parent) {
      throw new TypeError(`Deny creating of property '${key}' on ${typeof parent} '${String(parent)}' under the path '${walkedPath}'`)
    }
    if (typeof parent !== 'object') {
      if (!parent.hasOwnProperty(key)) {
        throw new TypeError(`Deny creating of property '${key}' on ${typeof parent} '${String(parent)}' under the path '${walkedPath}'`)
      }
      parent = (parent as any)[key]
    } else if (Array.isArray(parent) && parent.hasOwnProperty(key)) {
      parent = (parent as any)[key]
    } else if (Array.isArray(parent)) {
      const numKey = Number(key)
      if (isNaN(numKey) || numKey < 0) {
        throw new TypeError(`Deny creating of property '${key}' on array under the path '${walkedPath}'`)
      }
      if ((parent[numKey] === undefined || parent[numKey] === null) && !doNotCreate) {
        parent[numKey] = {}
      }
      parent = parent[numKey];
    } else {
      if ((!parent.hasOwnProperty(key) || parent[key] === undefined || parent[key] === null) && !doNotCreate) {
        parent[key] = {}
      }
      parent = parent.hasOwnProperty(key) ? parent[key] : undefined
    }
    walkedPath = walkedPath ? walkedPath + '.' + key : key
    prevIndex = nextIndex + 1;
  }
  while(nextIndex >= 0);

  return parent;
};




/**
 * Emulates browser for testing purposes when we want to test undefined context in node environment
 */
function setMockIsBrowser(isBrowser:boolean):void {
  mockIsBrowser = isBrowser
}

/**
 * Returns existing sub-object / sub-value of the context.
 * If sub-object does not exist it creates all necessary chain of sub-objects.
 * Always returns non-undefined.
 */
function namespace(name:string, context?:NsContext):NsVal {
  return rawNamespace(name, context)
}

/**
 * Returns existing sub-object / sub-value of the context.
 * If sub-object or unknown of sub-objects from the chain does not exist
 * it returns undefined without creating unknownthing.
 *
 * If context is not set it returns undefined.
 *
 * Does not modifies context
 */
function access(name:string, parent?:NsVal):NsVal {
  let prevIndex = 0;
  let nextIndex = indexOfPeriod(name, 0)

  do
  {
    nextIndex = indexOfPeriod(name, prevIndex)
    const key = unescapeKey(
      nextIndex >= 0
      ? name.substring(prevIndex, nextIndex)
      : name.substring(prevIndex)
    )
    if (!key) {
      throw new Error('Deny empty path piece in "' + name + '"')
    }

    if (!parent) {
      return undefined
    }

    parent = (parent as any).hasOwnProperty(key) ? (parent as any)[key as any] : undefined
    prevIndex = nextIndex + 1;
  }
  while(nextIndex >= 0);

  return parent;
}

/**
 * Assigns sub-value under the `name` in the `context` to the `val`
 * Creates all necessary sub-objects.
 * Fails if unknown sub-value in chain is not an object
 */
function assignInPlace(name:string, val:NsVal, context?:NsContext):void {
  throwIfNotContextNorBrowser(context)
  context = context || getGlobal()
  if (!context) {
    throw Error('Context is not defined and there isn\'t `window` nor `global` objects to set default context')
  }

  const index = lastIndexOfPeriod(name)
  if (index < 0) {
    if (!name) {
      throw new Error('Deny empty path')
    }
    ;(context as any)[name] = val
  } else {
    const ns = name.substring(0, index)
    const field = unescapeKey(name.substring(index + 1))

    if (!field) {
      throw new Error('Deny empty path piece in "' + name + '"')
    }

    const obj = namespace(ns, context)
    if (typeof obj !== 'object' || !obj) {
      throw new TypeError(`Deny creating of property '${field}' on ${typeof obj} '${String(obj)}' under the path '${ns}'`)
    } else if (Array.isArray(obj)) {
      const numKey = Number(field)
      if (isNaN(numKey) || numKey < 0) {
        throw new TypeError(`Deny creating of property '${field}' on array under the path '${ns}'`)
      }
      obj[numKey] = val
    } else {
      obj[field] = val
    }
  }
}

/**
  * Appends new fields to namespace `name`.
  *
  * By default uses as context `window` in browser.
  * On the server the context must be specified.
  *
  * Takes `obj` as set of `keys -> vals`.
  * Adds all `vals` with `keys` to the namespace.
  *
  * If `name` does not exist it creates it with `namespace()`.
  */
function appendInPlace(name:string, vals:NsContext, context?:NsContext):void {
  throwIfNotContextNorBrowser(context)
  if (typeof vals !== 'object' || vals === null) {
    throw new Error('The second argument must be an object')
  }
  const obj = namespace(name, context || getGlobal())
  if (typeof obj !== 'object' || !obj) {
    throw new TypeError(`Deny creating of properties on ${typeof obj} '${String(obj)}' under the path '${name}'`)
  } else if (Array.isArray(obj)) {
    for (const key in vals) {
      const numKey = Number(key)
      if (isNaN(numKey) || numKey < 0) {
        throw new TypeError(`Deny creating of property '${key}' on array under the path '${name}'`)
      }
      obj[numKey] = vals[key]
    }
  } else {
    for (const key in vals) {
      if (!key) {
        throw new Error('Deny appending under an empty field')
      }
      obj[key] = vals[key]
    }
  }
}

function assignRaw<T extends NsVal>(name: string, parent: T, value:NsVal, walkedPath:string):T {
  const dotIndex = indexOfPeriod(name)
  const field = unescapeKey(dotIndex < 0 ? name : name.substring(0, dotIndex))

  if (!field) {
    throw new Error('Deny empty path piece after "' + walkedPath + '"')
  }

  if (typeof parent !== 'object' && parent !== undefined) {
    throw new TypeError(`Deny creating of property '${field}' on ${typeof parent} '${String(parent)}' under the path '${walkedPath}'`)
  } else if (Array.isArray(parent)) {
    const numKey = Number(field)
    if (isNaN(numKey) || numKey < 0) {
      throw new TypeError(`Deny creating of property '${field}' on array under the path '${walkedPath}'`)
    }

    const replacedValue:NsVal = parent && parent[numKey]
    const wp = walkedPath ? walkedPath + '.' + field : field
    const replacingValue = dotIndex < 0
      ? value
      : assignRaw(name.substring(dotIndex + 1), replacedValue, value, wp)

    if (replacingValue === replacedValue) {
      return parent
    } else {
      const clone:any = parent.slice()
      clone[numKey] = replacingValue
      return clone
    }
  } else {
    const replacedValue:NsVal = parent && parent.hasOwnProperty(field)
      ? parent[field]
      : undefined
    const wp = walkedPath ? walkedPath + '.' + field : field
    const replacingValue = dotIndex < 0
      ? value
      : assignRaw(name.substring(dotIndex + 1), replacedValue, value, wp)

    if (replacingValue === replacedValue) {
      return parent
    } else {
      const clone = {...(parent as any)}
      clone[field] = replacingValue
      return clone
    }
  }
}

/**
 * Readonly replace some deep field in object
 * by making necessary copies of sub-objects.
 *
 * Does not change the `parent` object.
 */
function assign<T extends NsContext>(name:string, parent:T, value:NsVal):T {
  return assignRaw(name, parent, value, '')
}

const testingPurposes = {
  setMockIsBrowser,
}

export {
  NsContext as TNsContext,

  namespace,
  access,
  assignInPlace,
  appendInPlace,
  assign,

  testingPurposes,
}
