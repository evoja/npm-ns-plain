'use strict'

var tl = require('../test-lib.js')
var {namespace, access, assign, assignInPlace, appendInPlace,
    setMockIsBrowser
  } = tl.require('ns.js')

exports.test_namespace = function(test) {
  var obj = {}
  var x = namespace('a.b', obj)
  test.deepEqual(obj, {a:{b:{}}})
  test.strictEqual(obj.a.b, x)

  var y = namespace('a', obj)
  test.strictEqual(y, obj.a)
  test.done()
}

exports.test_namespaceToContext = function(test) {
  var obj = {m: {n: 3}}
  var x = namespace('a.b.c', obj)
  x.d = 5
  var y = namespace('a.b.c', obj)
  test.strictEqual(x, y, 'vars x and y must be the same object')
  test.equal(y.d, 5, 'vars x and y must be the same object')
  test.equal(obj.a.b.c.d, 5, 'namespace must be appended to context')

  var z = namespace('m', obj)
  test.equal(z.n, 3, 'must return existing object')
  test.done()
}

exports.namespaceRequiresBrowser = function(test) {
  if (typeof window !== 'undefined') {
    test.done()
    return
  }
  test.throws(() => namespace('a.b.c'), Error, 'must require browser or context')
  test.done()
}

exports.namespaceWorksWithMockIsBrowser_server = function(test) {
  if (typeof window !== 'undefined') {
    test.done()
    return
  }

  setMockIsBrowser(true);
  test.ok(!global.a);
  var x = namespace('a.b.c');
  x.d = 5;
  test.equal(global.a.b.c.d, 5, 'namespace must be appended to global');
  delete global['a'];
  setMockIsBrowser(false);
  test.done();
};

exports.namespaceWorksInBrowser_browser = function(test) {
  if (typeof window === 'undefined') {
    test.done()
    return
  }

  test.ok(!window.a);
  var x = namespace('a.b.c');
  x.d = 5;
  test.equal(window.a.b.c.d, 5, 'namespace must be appended to window');
  delete window['a'];
  test.done();
};



exports.test_access = function(test) {
  var obj = {}
  var z = access('x.y', obj)
  test.deepEqual(obj, {})
  test.strictEqual(z, undefined)

  test.done()
}

exports.test_assign = function(test) {
  var obj = {m: 1, n: 1, o: [1, 2, 3]}
  test.deepEqual({m: 2, n: 1, o: [1, 2, 3]}, assign('m', obj, 2))
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')

  var result = assign('o.1', obj, 20)
  test.deepEqual(result, {m: 1, n: 1, o: [1, 20, 3]})
  test.ok(Array.isArray(result.o))
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')
  test.done()
}

exports.test_assignInPlace = function(test) {
  var obj = {}
  assignInPlace('a.b.c', 10, obj)
  test.equal(obj.a.b.c, 10)
  assignInPlace('a.b.c', 20, obj)
  test.equal(obj.a.b.c, 20)
  test.done()
}

exports.test_assignInPlace_server = function(test) {
  if (typeof window !== 'undefined') {
    test.done()
    return
  }

  test.ok(!global.a)
  test.throws(() => assignInPlace('a.b.c', 10))
  test.ok(!global.a)

  setMockIsBrowser(true)
  assignInPlace('a.b.c', 10)
  test.equal(global.a.b.c, 10)
  assignInPlace('a.b.c', 20)
  test.equal(global.a.b.c, 20)
  delete global['a']
  setMockIsBrowser(false)

  test.throws(() => assignInPlace('a.b.c', 10))
  test.ok(!global.a)

  test.done()
}

exports.test_assignInPlace_browser = function(test) {
  if (typeof window === 'undefined') {
    test.done()
    return
  }

  test.ok(!window.a)
  assignInPlace('a.b.c', 10)
  test.equal(window.a.b.c, 10)
  assignInPlace('a.b.c', 20)
  test.equal(window.a.b.c, 20)
  delete window['a']
  test.ok(!window.a)

  test.done()
}


exports.test_appendInPlace = function(test) {
  var obj = {}
  appendInPlace('a.b.c', {d: 5, e: 10}, obj)
  test.deepEqual(obj.a.b.c, {d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30}, obj)
  test.deepEqual(obj.a.b.c, {d: 5, e: 20, f: 30})
  test.done()
}

exports.test_appendInPlace_server = function(test) {
  if (typeof window !== 'undefined') {
    test.done()
    return
  }

  test.ok(!global.a)
  test.throws(() => appendInPlace('a.b.c', {d: 5, e: 10}))
  test.ok(!global.a)

  setMockIsBrowser(true)
  appendInPlace('a.b.c', {d: 5, e: 10})
  test.deepEqual(global.a.b.c, {d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30})
  test.deepEqual(global.a.b.c, {d: 5, e: 20, f: 30})
  delete global['a']
  setMockIsBrowser(false)

  test.throws(() => appendInPlace('a.b.c', {d: 5, e: 10}))
  test.ok(!global.a)

  test.done()
}

exports.test_appendInPlace_browser = function(test) {
  if (typeof window === 'undefined') {
    test.done()
    return
  }

  test.ok(!window.a)
  appendInPlace('a.b.c', {d: 5, e: 10})
  test.deepEqual(window.a.b.c, {d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30})
  test.deepEqual(window.a.b.c, {d: 5, e: 20, f: 30})
  delete window['a']
  test.ok(!window.a)

  test.done()
}

