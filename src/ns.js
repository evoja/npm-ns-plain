'use strict'
var me = module.exports
var mockIsBrowser = undefined; 

function isBrowser() {
  return typeof window !== 'undefined' || mockIsBrowser
}

function getGlobal() {
  return typeof window !== 'undefined' && window || global
}

function throwIfNotContextNorBrowser(context) {
  if (!isBrowser() && !context) {
    throw new Error('Must run in browser or have non-null context');
  }
}

function rawNamespace(name, context, doNotCreate) {
  throwIfNotContextNorBrowser(context)
  var prevIndex = 0;
  var nextIndex = name.indexOf('.', 0);
  var parent = context || getGlobal();

  if (!parent) {
    throw Error('Context is not defined and there isn\'t `window` nor `global` objects to set default context')
  }

  do
  {
    if (!parent) {
      return undefined
    }

    nextIndex = name.indexOf('.', prevIndex);
    var key = nextIndex >= 0
      ? name.substring(prevIndex, nextIndex)
      : name.substring(prevIndex);

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
me.setMockIsBrowser = function setMockIsBrowser(isBrowser) {
  mockIsBrowser = isBrowser
}

/**
 * Returns existing sub-object / sub-value of the context.
 * If sub-object does not exist it creates all necessary chain of sub-objects.
 * Always returns non-undefined.
 */
me.namespace = function namespace(name, context) {
  return rawNamespace(name, context)
}

/**
 * Returns existing sub-object / sub-value of the context.
 * If sub-object or any of sub-objects from the chain does not exist
 * it returns undefined without creating anything.
 *
 * If context is not set it returns undefined.
 *
 * Does not modifies context
 */
me.access = function access(name, parent) {
  var prevIndex = 0;
  var nextIndex = name.indexOf('.', 0);

  do
  {
    if (!parent) {
      return undefined
    }

    nextIndex = name.indexOf('.', prevIndex);
    var key = nextIndex >= 0
      ? name.substring(prevIndex, nextIndex)
      : name.substring(prevIndex);

    parent = parent[key];
    prevIndex = nextIndex + 1;
  }
  while(nextIndex >= 0);

  return parent;
}

/**
 * Assigns sub-value under the `name` in the `context` to the `val`
 * Creates all necessary sub-objects.
 * Fails if any sub-value in chain is not an object
 */
me.assignInPlace = function assignInPlace(name, val, context) {
  throwIfNotContextNorBrowser(context)
  context = context || getGlobal()
  var index = name.lastIndexOf('.')
  if (index < 0) {
    context[name] = val
  } else {
    var ns = name.substring(0, index)
    var field = name.substring(index + 1)
    me.namespace(ns, context)[field] = val
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
me.appendInPlace = function appendInPlace(name, obj, context) {
  throwIfNotContextNorBrowser(context)
  var ns = me.namespace(name, context || getGlobal())
  for (var key in obj) {
    ns[key] = obj[key];
  }
}


/**
 * Readonly replace some deep field in object
 * by making necessary copies of sub-objects.
 *
 * Does not change the `parent` object.
 */
me.assign = function assign(name, parent, value) {
  name = typeof name == 'string' ? name : '' + name
  var dotIndex = name.indexOf('.')
  var field = dotIndex < 0 ? name : name.substring(0, dotIndex)
  var replacedValue = parent && parent[field]
  var replacingValue = dotIndex < 0
    ? value
    : assign(name.substring(dotIndex + 1), replacedValue, value)

  if (replacingValue === replacedValue) {
    return parent
  } else {
    var clone = Array.isArray(parent) ? parent.slice() : {...parent}
    clone[field] = replacingValue
    return clone
  }
}

