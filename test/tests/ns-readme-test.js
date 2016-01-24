'use strict';
var tl = require('../test-lib.js')

var {namespace, assign, access, setMockIsBrowser,
  assignInPlace, appendInPlace} = tl.require('ns.js')



exports.test_assign = function(test) {
  var obj = {a: {b: 1, c: 2}, d: {e: 3}}
  var origObj = {a: {b: 1, c: 2}, d: {e: 3}}
  var result = assign('a.b', obj, 100)

  test.deepEqual(result,
    {
      a: {
        b: 100,
        c: 2
      },
      d: {e: 3}
    })
  test.deepEqual(obj, origObj)
  test.notDeepEqual(result, origObj)
  test.strictEqual(obj.d, result.d)
  test.notStrictEqual(obj, result)

  obj = {}
  origObj = {}
  result = assign('a.b', obj, 100)
  test.deepEqual(result, {a: {b: 100}})
  test.deepEqual(obj, origObj)
  test.notDeepEqual(result, origObj)
  test.notStrictEqual(obj, result)

  test.done()
}

exports.test_access = function(test) {
  test.equal(access('a.b', {a: {b: 1, c: 2}}), 1)

  var obj = {}
  var res = access('a.b', obj)
  test.equal(typeof res, 'undefined')
  test.deepEqual(obj, {})

  test.done()
}

exports.test_namespace = function(test) {
  var obj = {}
  var res2 = namespace('a.b', obj)
  test.equal(typeof res2, 'object')
  test.deepEqual(res2, {})
  test.deepEqual(obj, {a: {b: {}}})
  test.done()
}

exports.test_namespace_server = function(test) {
  if(typeof window !== 'undefined') {
    test.done()
    return
  }

  test.ok(!global.a)
  test.throws(() => namespace('a.b'))
  test.ok(!global.a)

  setMockIsBrowser(true)
  var result = namespace('a.b')
  test.deepEqual(global.a, {b: {}})
  test.strictEqual(result, global.a.b)
  delete global.a
  setMockIsBrowser(false)

  test.ok(!global.a)
  test.throws(() => namespace('a.b'))
  test.ok(!global.a)
  test.done()
}


exports.test_namespace_browser = function(test) {
  if(typeof window === 'undefined') {
    test.done()
    return
  }
  test.ok(!window.a)
  var result = namespace('a.b')
  test.deepEqual(window.a, {b: {}})
  test.strictEqual(result, window.a.b)
  delete window.a
  test.ok(!window.a)
  test.done()
}


exports.test_assign_in_place = function(test) {
  var obj = {a: {b: 1, c: 2}, d: {e: 3}}
  var origObj = {a: {b: 1, c: 2}, d: {e: 3}}
  var result = assignInPlace('a.b', 100, obj)

  test.strictEqual(result, undefined)
  test.deepEqual(obj,
    {
      a: {
        b: 100,
        c: 2
      },
      d: {e: 3}
    })
  test.notDeepEqual(obj, origObj)

  obj = {}
  origObj = {}
  result = assignInPlace('a.b', 100, obj)
  test.strictEqual(result, undefined)
  test.deepEqual(obj, {a: {b: 100}})
  test.notDeepEqual(obj, origObj)

  test.done()
}

exports.test_append_in_place = function(test) {
  var obj = {a: {b: {x: 1, y: 2}, c: 2}, d: {e: 3}}
  var origObj = {a: {b: {x: 1, y: 2}, c: 2}, d: {e: 3}}
  var result = appendInPlace('a.b', {y: 20, z: 30}, obj)

  test.strictEqual(result, undefined)
  test.deepEqual(obj,
    {
      a: {
        b: {
          x: 1,
          y: 20,
          z: 30
        },
        c: 2
      },
      d: {e: 3}
    })
  test.notDeepEqual(obj, origObj)

  obj = {}
  origObj = {}
  result = appendInPlace('a.b', {y: 20, z: 30}, obj)
  test.strictEqual(result, undefined)
  test.deepEqual(obj, {a: {b: {y: 20, z: 30}}})
  test.notDeepEqual(obj, origObj)

  test.done()
}

