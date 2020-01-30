'use strict'
import {unescapeKey, indexOfPeriod, lastIndexOfPeriod} from './keys'
declare const global:unknown

type TContext = unknown[] | {[key:string]:unknown} | undefined

let mockIsBrowser:undefined|boolean = undefined

function isBrowser():boolean|undefined {
  return typeof window !== 'undefined' || mockIsBrowser
}

function getGlobal():undefined|TContext {
  return typeof window !== 'undefined' && window || (global as undefined|TContext)
}

function throwIfNotContextNorBrowser(context:unknown):void {
  if (!isBrowser() && !context) {
    throw new Error('Must run in browser or have non-null context');
  }
}

function rawNamespace(name:string, context:undefined|TContext, doNotCreate?:boolean):unknown {
  throwIfNotContextNorBrowser(context)
  let prevIndex = 0;
  let nextIndex = indexOfPeriod(name, 0)
  let parent:any = context || getGlobal()
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

    if (typeof parent !== 'object' && !parent) {
      throw new TypeError(`Cannot create property '${key}' on ${typeof parent} '${parent}' under the path '${walkedPath}'`)
    }
    walkedPath = walkedPath ? walkedPath + '.' + key : key

    if ((parent[key] === undefined || parent[key] === null) && !doNotCreate) {
      parent[key] = {}
    }
    parent = parent[key];
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
function namespace(name:string, context?:TContext):unknown {
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
function access(name:string, parent?:TContext):unknown {
  let prevIndex = 0;
  let nextIndex = indexOfPeriod(name, 0)
  let walkedPath = ''

  do
  {
    nextIndex = indexOfPeriod(name, prevIndex)
    const key = unescapeKey(
      nextIndex >= 0
      ? name.substring(prevIndex, nextIndex)
      : name.substring(prevIndex)
    )

    if (typeof parent !== 'object' && typeof parent !== 'undefined') {
      throw new TypeError(`Cannot create property '${key}' on ${typeof parent} '${parent}' under the path '${walkedPath}'`)
    }
    walkedPath = walkedPath ? walkedPath + '.' + key : key

    if (!parent) {
      return undefined
    }

    parent = (parent as any)[key] as any
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
function assignInPlace(name:string, val:unknown, context?:TContext):void {
  throwIfNotContextNorBrowser(context)
  context = context || getGlobal()
  if (!context) {
    throw Error('Context is not defined and there isn\'t `window` nor `global` objects to set default context')
  }

  const index = lastIndexOfPeriod(name)
  if (index < 0) {
    ;(context as any)[name] = val
  } else {
    const ns = name.substring(0, index)
    const field = unescapeKey(name.substring(index + 1))
    ;(namespace(ns, context) as any)[field] = val
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
function appendInPlace(name:string, obj:TContext, context?:TContext):void {
  throwIfNotContextNorBrowser(context)
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('The second argument must be an object')
  }
  const ns = namespace(name, context || getGlobal()) as any
  for (const key in obj) {
    ns[key] = (obj as any)[key]
  }
}


/**
 * Readonly replace some deep field in object
 * by making necessary copies of sub-objects.
 *
 * Does not change the `parent` object.
 */
function assign<T extends TContext>(name:string, parent:T, value:unknown):T {
  name = typeof name == 'string' ? name : '' + name
  const dotIndex = indexOfPeriod(name)
  const field = unescapeKey(dotIndex < 0 ? name : name.substring(0, dotIndex))
  const replacedValue = parent && (parent as any)[field] as TContext
  const replacingValue = dotIndex < 0
    ? value
    : assign(name.substring(dotIndex + 1), replacedValue, value)

  if (replacingValue === replacedValue) {
    return parent
  } else {
    const clone:any = Array.isArray(parent) ? parent.slice() : {...parent}
    clone[field] = replacingValue
    return clone
  }
}

const testingPurposes = {
  setMockIsBrowser,
}

export {
  TContext,

  namespace,
  access,
  assignInPlace,
  appendInPlace,
  assign,

  testingPurposes,
}
