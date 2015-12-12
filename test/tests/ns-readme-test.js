'use strict';
var tl = require('../test-lib.js')

var {namespace, assign, access, setMockIsBrowser} = tl.require('ns.js')



exports.test_assign = function(test) {
  test.deepEqual(
    assign('a.b', {a: {b: 1, c: 2}, d: {e: 3}}, 100),
    {
      a: {
        b: 100,
        c: 2
      },
      d: {e: 3}
    })

  test.deepEqual(assign('a.b', {}, 100),{a: {b: 100}})

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

