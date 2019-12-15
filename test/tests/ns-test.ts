'use strict'
import {Test} from 'nodeunit'
import {namespace, access, assign, assignInPlace, appendInPlace,
    setMockIsBrowser
  } from '../../src/ns'

declare const global:any
declare const window:any

export function test_namespace(test:Test) {
  var obj:any = {}
  var x = namespace('a.b', obj)
  test.deepEqual(obj, {a:{b:{}}}, 'Should create nested objects')
  test.strictEqual(obj.a.b, x, 'Lowest attached object in the hierarchy should be returned')

  var z = obj.a
  var y = namespace('a', obj)
  test.strictEqual(y, z, 'Should return existing object')
  test.strictEqual(y, obj.a, 'Should not recreate existing object')


  var obj:any = {}
  var z = namespace('a.b\\.\\\\.d', obj)
  test.deepEqual(obj, {a:{'b.\\':{d: {}}}})
  test.strictEqual(obj.a['b.\\'].d, z)

  test.done()
}

export function test_namespaceToContext(test:Test) {
  var obj:any = {m: {n: 3}}
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

export function namespaceRequiresBrowser(test:Test) {
  if (typeof window !== 'undefined') {
    test.done()
    return
  }
  test.throws(() => namespace('a.b.c'), Error, 'must require browser or context')
  test.done()
}

export function namespaceWorksWithMockIsBrowser_server(test:Test) {
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

export function namespaceWorksInBrowser_browser(test:Test) {
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

export function test_namespacesDoesNotCorruptArrays(test:Test) {
  var obj:any = {a: [1, {b: {c: 5}}]}
  var x = namespace('a', obj)
  test.ok(Array.isArray(x))
  var y = namespace('a.0', obj)
  test.equals(y, 1)
  test.ok(Array.isArray(obj.a))
  var z = namespace('a.1', obj)
  test.strictEqual(z, obj.a[1])
  test.ok(Array.isArray(obj.a))
  var u = namespace('a.1.b', obj)
  test.strictEqual(u, obj.a[1].b)
  test.ok(Array.isArray(obj.a))
  var v = namespace('a.2', obj)
  test.strictEqual(v, obj.a[2])
  test.ok(typeof v == 'object')
  test.deepEqual(v, {})
  test.ok(Array.isArray(obj.a))
  var w = namespace('a.3.c.d', obj)
  test.strictEqual(w, obj.a[3].c.d)
  test.ok(typeof w == 'object')
  test.deepEqual(v, {})
  test.ok(Array.isArray(obj.a))
  test.done()
}


export function test_access(test:Test) {
  var obj = {}
  var z = access('x.y', obj)
  test.deepEqual(obj, {})
  test.strictEqual(z, undefined)
  test.strictEqual(access('x.y'), undefined)

  obj = {a: {'b.\\': {c: 10}}}
  var z = access('a.b\\.\\\\.c', obj)
  test.deepEqual(obj, {a: {'b.\\': {c: 10}}})
  test.strictEqual(z, 10)
  test.strictEqual(access('a.b\\.\\\\.c'), undefined)

  test.done()
}

export function test_accessDoesNotCorruptArrays(test:Test) {
  var obj:any = {a: [1, {b: {c: 5}}]}
  var x = access('a', obj)
  test.ok(Array.isArray(x))
  var y = access('a.0', obj)
  test.equals(y, 1)
  test.ok(Array.isArray(obj.a))
  var z = access('a.1', obj)
  test.strictEqual(z, obj.a[1])
  test.ok(Array.isArray(obj.a))
  var u = access('a.1.b', obj)
  test.strictEqual(u, obj.a[1].b)
  test.ok(Array.isArray(obj.a))
  var v = access('a.2', obj)
  test.strictEqual(v, undefined)
  test.ok(Array.isArray(obj.a))
  var w = access('a.3.c.d', obj)
  test.strictEqual(w, undefined)
  test.ok(Array.isArray(obj.a))
  test.done()
}


export function test_assign(test:Test) {
  var obj = {m: 1, n: 1, o: [1, 2, 3]}
  test.deepEqual({m: 2, n: 1, o: [1, 2, 3]}, assign('m', obj, 2))
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')

  var result = assign('o.1', obj, 20)
  test.deepEqual(result, {m: 1, n: 1, o: [1, 20, 3]})
  test.ok(Array.isArray(result.o))
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')

  var result1 = assign('m.n\\..k', obj, 2)
  test.deepEqual(result1, {m: {'n.': {k: 2}}, n: 1, o: [1, 2, 3]})
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')
  test.strictEqual(result1.m['n.'].k, 2)

  test.done()
}

export function test_assignDoesNotCorruptArrays(test:Test) {
  var obj:any = {a: [1, {b: {c: 5}}]}

  var res:any = assign('a', obj, 10)
  test.equals(res.a, 10)

  res = assign('a.0', obj, 10)
  test.equals(res.a[0], 10)
  test.ok(Array.isArray(res.a))
  test.ok(Array.isArray(obj.a))

  res = assign('a.1', obj, 10)
  test.strictEqual(res.a[1], 10)
  test.ok(Array.isArray(res.a))
  test.ok(Array.isArray(obj.a))

  res = assign('a.1.b', obj,10)
  test.strictEqual(res.a[1].b, 10)
  test.ok(Array.isArray(res.a))
  test.ok(Array.isArray(obj.a))

  res = assign('a.2', obj, undefined)
  test.strictEqual(res.a[2], undefined)
  test.ok(Array.isArray(res.a))
  test.ok(Array.isArray(obj.a))

  res = assign('a.2', obj, 10)
  test.strictEqual(res.a[2], 10)
  test.ok(Array.isArray(res.a))
  test.ok(Array.isArray(obj.a))

  res = assign('a.3.c.d', obj, 10)
  test.strictEqual(res.a[3].c.d, 10)
  test.ok(Array.isArray(res.a))
  test.ok(Array.isArray(obj.a))
  test.done()
}

export function test_assignInPlace(test:Test) {
  var obj:any = {}
  assignInPlace('a.b.c', 10, obj)
  test.strictEqual(obj.a.b.c, 10)
  assignInPlace('a.b.c', 20, obj)
  test.strictEqual(obj.a.b.c, 20)
  assignInPlace('k.m\\..n', 30, obj)
  test.strictEqual(obj.k['m.'].n, 30)
  test.deepEqual(obj, {a: {b: {c: 20}}, k: {'m.': {n: 30}}})
  test.done()
}

export function test_assignInPlaceDoesNotCorruptArrays(test:Test) {
  var obj:any = {a: [1, {b: {c: 5}}]}
  assignInPlace('a', 10, obj)
  test.equals(obj.a, 10)

  assignInPlace('a', undefined, obj)
  test.strictEqual(obj.a, undefined)

  obj = {a: [1, {b: {c: 5}}]}
  assignInPlace('a.0', 10, obj)
  test.equals(obj.a[0], 10)
  test.ok(Array.isArray(obj.a))

  assignInPlace('a.1', 10, obj)
  test.strictEqual(obj.a[1], 10)
  test.ok(Array.isArray(obj.a))

  obj = {a: [1, {b: {c: 5}}]}
  assignInPlace('a.1.b', 10, obj)
  test.strictEqual(obj.a[1].b, 10)
  test.ok(Array.isArray(obj.a))

  assignInPlace('a.2', undefined, obj)
  test.strictEqual(obj.a[2], undefined)
  test.ok(Array.isArray(obj.a))

  assignInPlace('a.2', 10, obj)
  test.strictEqual(obj.a[2], 10)
  test.ok(Array.isArray(obj.a))

  assignInPlace('a.3.c.d', 10, obj)
  test.strictEqual(obj.a[3].c.d, 10)
  test.ok(Array.isArray(obj.a))
  test.done()
}

export function test_assignInPlace_server(test:Test) {
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

export function test_assignInPlace_browser(test:Test) {
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


export function test_appendInPlace(test:Test) {
  var obj:any = {}
  appendInPlace('a.b.c', {d: 5, e: 10}, obj)
  test.deepEqual(obj.a.b.c, {d: 5, e: 10})
  test.notStrictEqual(obj.a.b.c, {d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30}, obj)
  test.deepEqual(obj.a.b.c, {d: 5, e: 20, f: 30})
  test.notStrictEqual(obj.a.b.c, {d: 5, e: 20, f: 30})
  test.throws(() => appendInPlace('a.b.c', 30, obj), Error)
  test.throws(() => appendInPlace('a.b.c.d', {a:5}, obj), Error)
  appendInPlace('a.b.c\\.', {x: 1, y: 2}, obj)
  test.deepEqual(obj.a.b['c.'], {x: 1, y: 2})
  test.notStrictEqual(obj.a.b['c.'], {x: 1, y: 2})
  test.deepEqual(obj.a.b, {c: {d: 5, e: 20, f: 30}, 'c.': {x: 1, y: 2}})
  test.notStrictEqual(obj.a.b, {c: {d: 5, e: 20, f: 30}, 'c.': {x: 1, y: 2}})
  test.done()
}

export function test_appendInPlaceDoesNotCorruptArrays(test:Test) {
  var obj:any = {a: [1, {b: {c: 5}}]}
  var x = {a:10}
  appendInPlace('a', x, obj)
  var y:any = [1, {b: {c: 5}}]
  y.a = 10;
  test.deepEqual(obj.a, y)

  appendInPlace('a.1', x, obj)
  test.deepEqual(obj.a[1], {b: {c:5}, a:10})
  test.ok(Array.isArray(obj.a))

  obj = {a: [1, {b: {c: 5}}]}
  appendInPlace('a.1.b', x, obj)
  test.deepEqual(obj.a[1].b, {a:10, c:5})
  test.ok(Array.isArray(obj.a))

  appendInPlace('a.2', x, obj)
  test.deepEqual(obj.a[2], x)
  test.ok(Array.isArray(obj.a))

  appendInPlace('a.3.c.d', x, obj)
  test.deepEqual(obj.a[3].c.d, x)
  test.ok(Array.isArray(obj.a))

  var z: any = []
  z[1] = 10;
  appendInPlace('a', z, obj);
  test.deepEqual(obj.a, [1, 10, {a:10}, {c: {d: {a: 10}}}])
  test.ok(Array.isArray(obj.a))

  appendInPlace('a', [undefined, 20], obj);
  test.deepEqual(obj.a, [undefined, 20, {a:10}, {c: {d: {a: 10}}}])
  test.ok(Array.isArray(obj.a))

  appendInPlace('a', {'1': 30}, obj);
  test.deepEqual(obj.a, [undefined, 30, {a:10}, {c: {d: {a: 10}}}])
  test.ok(Array.isArray(obj.a))

  test.done()
}

export function test_appendInPlace_server(test:Test) {
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

export function test_appendInPlace_browser(test:Test) {
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

