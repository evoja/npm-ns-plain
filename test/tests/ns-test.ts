'use strict'

import {Test} from 'nodeunit'
import {namespace, access, assign, assignInPlace, appendInPlace,
    testingPurposes,
} from '../../src/ns'
const {setMockIsBrowser} = testingPurposes
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
  var z = namespace('a.b\\.\\\\.d', obj) as any
  test.deepEqual(obj, {a:{'b.\\':{d: {}}}})
  test.strictEqual(obj.a['b.\\'].d, z)

  test.done()
}

export function test_namespaceToContext(test:Test) {
  var obj:any = {m: {n: 3}}
  var x = namespace('a.b.c', obj) as any
  x.d = 5
  var y = namespace('a.b.c', obj) as any
  test.strictEqual(x, y, 'vars x and y must be the same object')
  test.equal(y.d, 5, 'vars x and y must be the same object')
  test.equal(obj.a.b.c.d, 5, 'namespace must be appended to context')

  var z = namespace('m', obj) as any
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
  var x = namespace('a.b.c') as any
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
  var x = namespace('a.b.c') as any
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

  test.throws(() => namespace('a.b', obj), TypeError)
  test.throws(() => namespace('a.c.d.e', obj), TypeError)
  test.strictEqual(namespace('a.length', obj), 4)
  test.ok(Array.isArray(obj.a))

  test.deepEqual(obj.a, [ 1, { b: { c: 5 } }, {}, { c: { d: {} } } ])
  test.done()
}

export function test_namespaceForPrimitives(test:Test) {
  var obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str: 'hello',
    nl: null,
    un: undefined
  }
  test.strictEqual(typeof obj.un, 'undefined')
  test.strictEqual(obj.nl, null)

  test.strictEqual(typeof namespace('num', obj), 'number')
  test.strictEqual(namespace('num', obj), 1)
  // test.strictEqual(typeof namespace('bgnt', obj), 'bigint')
  // test.strictEqual(typeof namespace('sym', obj), 'symbol')
  test.strictEqual(typeof namespace('bool', obj), 'boolean')
  test.strictEqual(namespace('bool', obj), false)
  test.strictEqual(typeof namespace('str', obj), 'string')
  test.strictEqual(namespace('str', obj), 'hello')
  test.strictEqual(typeof namespace('nl', obj), 'object')
  test.deepEqual(namespace('nl', obj), {})
  test.strictEqual(typeof namespace('un', obj), 'object')
  test.deepEqual(namespace('un', obj), {})
  test.strictEqual(typeof namespace('str.length', obj), 'number')
  test.strictEqual(namespace('str.length', obj), 5)

  test.deepEqual(obj.nl, {})
  test.strictEqual(typeof obj.un, 'object')
  obj.nl = undefined
  obj.un = undefined

  test.throws(() => namespace('num.a', obj), TypeError)
  // test.throws(() => namespace('bgnt.a', obj), TypeError)
  // test.throws(() => namespace('sym.a', obj), TypeError)
  test.throws(() => namespace('bool.a', obj), TypeError)
  test.throws(() => namespace('str.a', obj), TypeError)
  const nl = namespace('nl.b', obj)
  const un = namespace('un.c', obj)
  test.deepEqual(nl, {})
  test.strictEqual(obj.nl.b, nl)
  test.deepEqual(un, {})
  test.strictEqual(obj.un.c, un)
  test.deepEqual(obj, {num: 1, bool: false, str:'hello', nl: {b:{}}, un: {c:{}}})
  test.done()
}

export function test_namespaceForFunctions(test:Test) {
  var obj:any = {
    sum: (a:number, b:number) => a + b,
  }

  test.strictEqual(typeof namespace('sum', obj), 'function')
  test.strictEqual(namespace('sum', obj), obj.sum)
  test.strictEqual(typeof namespace('sum.name', obj), 'string')
  test.strictEqual(namespace('sum.name', obj), 'sum')
  test.strictEqual(typeof namespace('sum.length', obj), 'number')
  test.strictEqual(namespace('sum.length', obj), 2)
  test.throws(() => namespace('sum.bind', obj), TypeError)
  test.throws(() => namespace('sum.a', obj), TypeError)
  test.done()
}

const somePrototype = {
  superProp: {a: 10}
}
function SomeConstructor() {
  this.prop = {b: 20}
}
SomeConstructor.prototype = somePrototype

class SuperClass {
  superFun(a:number) {}
  superProp: any
  constructor() {
    this.superProp = {c: 30}
  }
}
class SubClass extends SuperClass {
  fun(a:number, b: number){}
  prop: any
  constructor() {
    super()
    this.prop = {d: 40}
  }
}

export function test_namespaceForPrototypes(test:Test) {
  let obj:any = new (SomeConstructor as any)()
  const superProp = obj.superProp

  // pre test
  test.strictEqual(obj.superProp.a, 10)
  test.deepEqual(obj.superProp, {a: 10})
  // test
  test.strictEqual(namespace('prop.b', obj), 20)
  test.strictEqual(typeof namespace('prop.c', obj), 'object')
  test.deepEqual(obj, {prop: {b: 20, c: {}}})
  test.strictEqual(typeof namespace('superProp', obj), 'object')
  test.deepEqual(obj, {prop: {b: 20, c: {}}, superProp: {}})
  test.notStrictEqual(obj.superProp, superProp)
  test.strictEqual(typeof namespace('superProp.a', obj), 'object')
  test.deepEqual(obj, {prop: {b: 20, c: {}}, superProp: {a: {}}})

  obj = new SubClass()
  // pre test
  test.strictEqual(obj.superProp.c, 30)
  test.strictEqual(obj.prop.d, 40)
  test.deepEqual(obj, {prop: {d: 40}, superProp: {c: 30}})
  test.strictEqual(typeof obj.superFun, 'function')
  test.strictEqual(obj.superFun.length, 1)
  test.strictEqual(typeof obj.fun, 'function')
  test.strictEqual(obj.fun.length, 2)

  // test
  test.strictEqual(namespace('superProp.c', obj), 30)
  test.strictEqual(namespace('prop.d', obj), 40)
  test.strictEqual(typeof namespace('superFun.length', obj), 'object')
  test.strictEqual(typeof namespace('fun', obj), 'object')
  test.deepEqual(obj, {
    superProp: {c: 30},
    prop: {d: 40},
    superFun: {length: {}},
    fun: {},
  })

  test.done()
}

export function test_namespaceBlankPaths(test:Test) {
  let obj = {a: {b: 10}}
  test.throws(() => namespace('', obj), Error)//, 'Deny path piece afer ""')
  test.throws(() => namespace('a..b', obj), Error)//, 'Deny empty path piece after "a"')
  test.throws(() => namespace('a.b.', obj), Error)//, 'Deny empty path piece after "a.b"')
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

  let r = access('a.b', obj) as any
  test.strictEqual(r, undefined)
  test.ok(Array.isArray(obj.a))

  let t = access('a.c.d.e', obj)
  test.strictEqual(t, undefined)
  test.ok(Array.isArray(obj.a))

  let s = access('a.length', obj) as any
  test.strictEqual(s, 2)
  test.ok(Array.isArray(obj.a))

  test.done()
}

export function test_accessForPrimitives(test:Test) {
  var obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  test.strictEqual(typeof access('num', obj), 'number')
  test.strictEqual(access('num', obj), 1)
  // test.strictEqual(typeof access('bgnt', obj), 'bigint')
  // test.strictEqual(typeof access('sym', obj), 'symbol')
  test.strictEqual(typeof access('bool', obj), 'boolean')
  test.strictEqual(access('bool', obj), false)
  test.strictEqual(typeof access('str', obj), 'string')
  test.strictEqual(access('str', obj), 'hello')
  test.strictEqual(typeof access('nl', obj), 'object')
  test.strictEqual(access('nl', obj), null)
  test.strictEqual(typeof access('un', obj), 'undefined')
  test.strictEqual(access('un', obj), undefined)
  test.strictEqual(typeof access('str.length', obj), 'number')
  test.strictEqual(access('str.length', obj), 5)

  test.strictEqual(access('num.a', obj), undefined)
  // test.strictEqual(access('bgnt.a', obj), undefined)
  // test.strictEqual(access('sym.a', obj), undefined)
  test.strictEqual(access('bool.a', obj), undefined)
  test.strictEqual(access('str.a', obj), undefined)
  test.strictEqual(access('nl.b', obj), undefined)
  test.strictEqual(access('un.c', obj), undefined)
  test.deepEqual(obj, {num: 1, bool: false, str:'hello', nl: null, un: undefined})
  test.done()
}

export function test_accessForFunctions(test:Test) {
  var obj:any = {
    sum: (a:number, b:number) => a + b,
  }

  test.strictEqual(typeof access('sum', obj), 'function')
  test.strictEqual(access('sum', obj), obj.sum)
  test.strictEqual(typeof access('sum.name', obj), 'string')
  test.strictEqual(access('sum.name', obj), 'sum')
  test.strictEqual(typeof access('sum.length', obj), 'number')
  test.strictEqual(access('sum.length', obj), 2)
  test.strictEqual(access('sum.bind', obj), undefined)
  test.strictEqual(access('sum.a', obj), undefined)
  test.done()
}

export function test_accessForPrototypes(test:Test) {
  let obj:any = new (SomeConstructor as any)()

  // pre test
  test.strictEqual(obj.superProp.a, 10)
  test.deepEqual(obj.superProp, {a: 10})
  // test
  test.strictEqual(access('prop.b', obj), 20)
  test.strictEqual(access('superProp.a', obj), undefined)
  test.strictEqual(access('superProp', obj), undefined)
  test.deepEqual(obj, {prop: {b: 20}})

  obj = new SubClass()
  // pre test
  test.strictEqual(obj.superProp.c, 30)
  test.strictEqual(obj.prop.d, 40)
  test.deepEqual(obj, {prop: {d: 40}, superProp: {c: 30}})
  test.strictEqual(typeof obj.superFun, 'function')
  test.strictEqual(obj.superFun.length, 1)
  test.strictEqual(typeof obj.fun, 'function')
  test.strictEqual(obj.fun.length, 2)

  // test
  test.strictEqual(access('superProp.c', obj), 30)
  test.strictEqual(access('prop.d', obj), 40)
  test.strictEqual(access('superFun.length', obj), undefined)
  test.strictEqual(access('superFun', obj), undefined)
  test.strictEqual(access('fun', obj), undefined)
  test.deepEqual(obj, {
    superProp: {c: 30},
    prop: {d: 40},
  })

  test.done()
}

export function test_accessBlankPaths(test:Test) {
  let obj = {a: {b: 10}}
  test.throws(() => access('', obj), Error)//, 'Deny path piece afer ""')
  test.throws(() => access('a..b', obj), Error)//, 'Deny empty path piece after "a"')
  test.throws(() => access('a.b.', obj), Error)//, 'Deny empty path piece after "a.b"')
  test.done()
}



export function test_assign(test:Test) {
  var obj:any = {m: 1, n: 1, o: [1, 2, 3]}
  test.deepEqual({m: 2, n: 1, o: [1, 2, 3]}, assign('m', obj, 2))
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')

  var result = assign('o.1', obj, 20) as any
  test.deepEqual(result, {m: 1, n: 1, o: [1, 20, 3]})
  test.ok(Array.isArray(result.o))
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')

  let result1 = assign('l', obj, 2) as any
  test.deepEqual(result1, {m: 1, l: 2, n: 1, o: [1, 2, 3]})
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')
  test.strictEqual(result1.l, 2)


  result1 = assign('n\\..k.c', obj, 2) as any
  test.deepEqual(result1, {m: 1, 'n.': {k: {c: 2}}, n: 1, o: [1, 2, 3]})
  test.deepEqual(obj, {m: 1, n: 1, o: [1, 2, 3]}, 'obj must not be changed')
  test.strictEqual(result1['n.'].k.c, 2)

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

  test.throws(() => assign('a.b', obj, 10), TypeError)
  test.ok(Array.isArray(obj.a))

  test.throws(() => assign('a.c.d.e', obj, 10), TypeError)
  test.ok(Array.isArray(obj.a))

  test.throws(() => assign('a.length', obj, 10), TypeError)
  test.ok(Array.isArray(obj.a))

  test.done()
}

export function test_assignForPrimitives(test:Test) {
  var obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hi',
    nl: null,
    un: undefined
  }

  test.strictEqual(assign('num', obj, 2).num, 2)
  // test.strictEqual(typeof assign('bgnt', obj), 'bigint')
  // test.strictEqual(typeof assign('sym', obj), 'symbol')
  test.strictEqual(assign('bool', obj, true).bool, true)
  test.strictEqual(assign('str', obj, 'goodbye').str, 'goodbye')
  test.strictEqual(assign('nl', obj, 'some').nl, 'some')
  test.strictEqual(assign('un', obj, 'other').un, 'other')

  test.throws(() => assign('num.a', obj, 1), TypeError)
  // test.throws(() => assign('bgnt.a', obj), TypeError)
  // test.throws(() => assign('sym.a', obj), TypeError)
  test.throws(() => assign('bool.b', obj, 2), TypeError)
  test.throws(() => assign('str.c', obj, 3), TypeError)
  test.throws(() => assign('str.1', obj, 'o'), TypeError)
  test.throws(() => assign('str.length', obj, 10).str, TypeError)
  test.deepEqual(assign('nl.d', obj, 4).nl, {d:4})
  test.deepEqual(assign('un.e', obj, 5).un, {e:5})
  test.done()
}

export function test_assignForFunctions(test:Test) {
  var obj:any = {
    sum: (a:number, b:number) => a + b,
  }

  test.strictEqual(assign('sum', obj, 1).sum, 1)
  test.throws(() => assign('sum.name', obj, 'hello'), TypeError)
  test.throws(() => assign('sum.length', obj, 10), TypeError)
  test.throws(() => assign('sum.bind', obj, ()=>{}), TypeError)
  test.throws(() => assign('sum.a', obj, 4), TypeError)
  test.done()
}

export function test_assignForPrototypes(test:Test) {
  let obj:any = new (SomeConstructor as any)()

  // pre test
  test.strictEqual(obj.superProp.a, 10)
  test.deepEqual(obj.superProp, {a: 10})
  // test
  test.strictEqual(assign('prop.b', obj, 200).prop.b, 200)
  test.strictEqual(assign('prop.bbb', obj, 2000).prop.b, 20)
  test.strictEqual(assign('superProp.a', obj, 100).superProp.a, 100)
  test.strictEqual(assign('superProp.aaa', obj, 1000).superProp.a, undefined)
  const x = assign('prop.c', assign('superProp.d', obj, 'dd'), 'cc')
  test.deepEqual(x, {prop: {b: 20, c: 'cc'}, superProp: {d: 'dd'}})

  obj = new SubClass()
  // pre test
  test.strictEqual(obj.superProp.c, 30)
  test.strictEqual(obj.prop.d, 40)
  test.deepEqual(obj, {prop: {d: 40}, superProp: {c: 30}})
  test.strictEqual(typeof obj.superFun, 'function')
  test.strictEqual(obj.superFun.length, 1)
  test.strictEqual(typeof obj.fun, 'function')
  test.strictEqual(obj.fun.length, 2)

  // test
  test.strictEqual(assign('superProp.c', obj, 300).superProp.c, 300)
  test.strictEqual(assign('superProp.ccc', obj, 3000).superProp.c, 30)
  test.strictEqual(assign('prop.d', obj, 400).prop.d, 400)
  test.strictEqual(assign('prop.ddd', obj, 4000).prop.d, 40)
  test.strictEqual(assign('superFun.length', obj, 10).superFun.length, 10)
  test.strictEqual(assign('superFun', obj, 20).superFun, 20)
  test.strictEqual(assign('fun', obj, 30).fun, 30)

  test.done()
}

export function test_assignBlankPaths(test:Test) {
  let obj = {a: {b: 10}}
  test.throws(() => assign('', obj, 10), Error)//, 'Deny path piece afer ""')
  test.throws(() => assign('a..b', obj, 10), Error)//, 'Deny empty path piece after "a"')
  test.throws(() => assign('a.b.', obj, 10), Error)//, 'Deny empty path piece after "a.b"')
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


  test.throws(() => assignInPlace('a.b', 10, obj), TypeError)
  test.ok(Array.isArray(obj.a))

  test.throws(() => assignInPlace('a.c.d.e', 10, obj), TypeError)
  test.ok(Array.isArray(obj.a))

  test.throws(() => assignInPlace('a.length', 10, obj), TypeError)
  test.ok(Array.isArray(obj.a))

  test.done()
}

export function test_assignInPlaceForPrimitives(test:Test) {
  let obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }
  test.strictEqual(typeof obj.un, 'undefined')
  test.strictEqual(obj.nl, null)

  assignInPlace('num', 2, obj)
  test.strictEqual(obj.num, 2)
  // test.strictEqual(typeof assignInPlace('bgnt', obj), 'bigint')
  // test.strictEqual(typeof assignInPlace('sym', obj), 'symbol')
  assignInPlace('bool', true, obj)
  test.strictEqual(obj.bool, true)
  assignInPlace('str', 'goodbye', obj)
  test.strictEqual(obj.str, 'goodbye')
  assignInPlace('nl', 'some', obj)
  test.strictEqual(obj.nl, 'some')
  assignInPlace('un', 'other', obj)
  test.strictEqual(obj.un, 'other')
  test.throws(() => assignInPlace('str.length', 10, obj), TypeError)

  test.deepEqual(obj, {
    num: 2,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: true,
    str:'goodbye',
    nl: 'some',
    un: 'other',
  })

  obj = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  test.throws(() => assignInPlace('num.a', 1, obj), TypeError)
  // test.throws(() => assignInPlace('bgnt.a', obj), TypeError)
  // test.throws(() => assignInPlace('sym.a', obj), TypeError)
  test.throws(() => assignInPlace('bool.a', 2, obj), TypeError)
  test.throws(() => assignInPlace('str.a', 3, obj), TypeError)
  assignInPlace('nl.b', 4, obj)
  assignInPlace('un.c', 5, obj)
  test.deepEqual(obj.nl, {b:4})
  test.strictEqual(obj.nl.b, 4)
  test.deepEqual(obj.un, {c:5})
  test.strictEqual(obj.un.c, 5)
  test.deepEqual(obj, {num: 1, bool: false, str:'hello', nl: {b:4}, un: {c:5}})
  test.done()
}

export function test_accessInPlaceForFunctions(test:Test) {
  var obj:any = {
    sum: (a:number, b:number) => a + b,
  }
  var sum = obj.sum

  assignInPlace('sum', 1, obj)
  test.strictEqual(obj.sum, 1)
  obj.sum = sum
  test.throws(() => assignInPlace('sum.name', 'hello', obj), TypeError)
  test.throws(() => assignInPlace('sum.length', 1, obj), TypeError)
  test.throws(() => assignInPlace('sum.bind', ()=>{}, obj), TypeError)
  test.throws(() => assignInPlace('sum.a', 1, obj), TypeError)
  test.done()
}

export function test_assignInPlacePrototypes(test:Test) {
  let obj:any = new (SomeConstructor as any)()
  let superProp = obj.superProp

  // pre test
  test.strictEqual(obj.superProp.a, 10)
  test.deepEqual(obj.superProp, {a: 10})

  // test
  assignInPlace('prop.bbb', 2000, obj)
  assignInPlace('superProp.aaa', 1000, obj)
  test.deepEqual(obj, {prop: {b: 20, bbb: 2000}, superProp: {aaa: 1000}})
  assignInPlace('superProp.a', 100, obj)
  test.deepEqual(superProp, {a: 10})

  obj = new SubClass()
  // pre test
  test.strictEqual(obj.superProp.c, 30)
  test.strictEqual(obj.prop.d, 40)
  test.deepEqual(obj, {prop: {d: 40}, superProp: {c: 30}})
  test.strictEqual(typeof obj.superFun, 'function')
  test.strictEqual(obj.superFun.length, 1)
  test.strictEqual(typeof obj.fun, 'function')
  test.strictEqual(obj.fun.length, 2)

  // test
  assignInPlace('superProp.ccc', 3000, obj)
  assignInPlace('prop.ddd', 4000, obj)
  assignInPlace('superFun.length', 10, obj)
  test.deepEqual(obj, {
    superProp: {c: 30, ccc: 3000},
    prop: {d: 40, ddd: 4000},
    superFun: {length: 10},
  })
  test.strictEqual(typeof obj.superFun, 'object')
  test.strictEqual(typeof obj.fun, 'function')

  test.done()
}

export function test_assignInPlaceBlankPaths(test:Test) {
  let obj = {a: {b: 10}}
  test.throws(() => assignInPlace('', 10, obj), Error)//, 'Deny path piece afer ""')
  test.throws(() => assignInPlace('a..b', 10, obj), Error)//, 'Deny empty path piece after "a"')
  test.throws(() => assignInPlace('a.b.', 10, obj), Error)//, 'Deny empty path piece after "a.b"')
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
  test.throws(() => appendInPlace('a.b.c', 30 as any, obj), Error)
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
  test.throws(() => appendInPlace('a', x, obj), TypeError)
  var y:any = [1, {b: {c: 5}}]
  test.deepEqual(obj.a, y)

  var u = {length:10}
  test.throws(() => appendInPlace('a', u, obj), TypeError)
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

export function test_appendInPlaceForPrimitives(test:Test) {
  let obj:any = {
    x: {
      num: 1,
      // bgnt: 1n,            // bigint is commented because target=es5
      // sym: Symbol('foo'),  // symbol is commented because target=es5
      bool: false,
      str:'hello',
      nl: null,
      un: undefined
    }
  }
  test.strictEqual(typeof obj.x.un, 'undefined')
  test.strictEqual(obj.x.nl, null)

  // appendInPlace('', {num: 2, bool: true, str: 'goodbye', nl: 4, un: 5}, obj)
  appendInPlace('x', {num: 2, bool: true, str: 'goodbye', nl: 4, un: 5}, obj)
  test.strictEqual(obj.x.num, 2)
  test.strictEqual(obj.x.bool, true)
  test.strictEqual(obj.x.str, 'goodbye')
  test.strictEqual(obj.x.nl, 4)
  test.strictEqual(obj.x.un, 5)
  test.deepEqual(obj, {x:{num: 2, bool: true, str: 'goodbye', nl: 4, un: 5}})

  obj = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  test.throws(() => appendInPlace('num', {a:1}, obj), TypeError)
  // test.strictEqual(typeof appendInPlace('bgnt', obj), 'bigint')
  // test.strictEqual(typeof appendInPlace('sym', obj), 'symbol')
  test.throws(() => appendInPlace('bool', {a:1}, obj), TypeError)
  test.throws(() => appendInPlace('str', {a:1}, obj), TypeError)
  test.throws(() => appendInPlace('str', {length:1}, obj), TypeError)
  appendInPlace('nl', {a: 1}, obj)
  test.deepEqual(obj.nl, {a:1})
  test.strictEqual(obj.nl.a , 1)
  appendInPlace('un', {b: 2}, obj)
  test.deepEqual(obj.un, {b:2})
  test.strictEqual(obj.un.b , 2)
  test.deepEqual(obj, {num: 1, bool: false, str: 'hello', nl:{a:1}, un:{b:2}})

  obj = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  test.throws(() => appendInPlace('num.a', {a:1}, obj), TypeError)
  // test.throws(() => appendInPlace('bgnt.a', obj), TypeError)
  // test.throws(() => appendInPlace('sym.a', obj), TypeError)
  test.throws(() => appendInPlace('bool.a', {a:1}, obj), TypeError)
  test.throws(() => appendInPlace('str.a', {a:1}, obj), TypeError)
  appendInPlace('nl.b', {a: 1}, obj)
  test.deepEqual(obj.nl, {b:{a:1}})
  test.strictEqual(obj.nl.b.a , 1)
  appendInPlace('un.c', {b:2},  obj)
  test.deepEqual(obj.un, {c:{b:2}})
  test.strictEqual(obj.un.c.b, 2)
  test.deepEqual(obj, {num: 1, bool: false, str:'hello', nl: {b:{a:1}}, un: {c:{b:2}}})
  test.done()
}

export function test_appendInPlaceForFunctions(test:Test) {
  var obj:any = {
    x: {
      sum: (a:number, b:number) => a + b,
    }
  }
  var sum = obj.x.sum

  appendInPlace('x', {sum:1}, obj)
  test.strictEqual(obj.x.sum, 1)
  obj = obj.x
  obj.sum = sum
  test.throws(() => appendInPlace('sum', {name: 'hello'}, obj), TypeError)
  test.throws(() => appendInPlace('sum', {length: 1}, obj), TypeError)
  test.throws(() => appendInPlace('sum', {bind: ()=>{}}, obj), TypeError)
  test.throws(() => appendInPlace('sum', {a: 10}, obj), TypeError)
  test.throws(() => appendInPlace('sum.name', {a: 10}, obj), TypeError)
  test.throws(() => appendInPlace('sum.length', {a: 10}, obj), TypeError)
  test.throws(() => appendInPlace('sum.bind', {a: 10}, obj), TypeError)
  test.throws(() => appendInPlace('sum.a', {a: 10}, obj), TypeError)
  test.done()
}

export function test_appendInPlacePrototypes(test:Test) {
  let obj:any = new (SomeConstructor as any)()
  let superProp = obj.superProp

  // pre test
  test.strictEqual(obj.superProp.a, 10)
  test.deepEqual(obj.superProp, {a: 10})
  obj = {x: obj}

  // test
  appendInPlace('x.prop', {bbb: 2000}, obj)
  appendInPlace('x.superProp', {aaa: 1000}, obj)
  test.deepEqual(obj.x, {prop: {b: 20, bbb: 2000}, superProp: {aaa: 1000}})
  appendInPlace('x.superProp',{a: 100, aaa: 1}, obj)
  test.deepEqual(superProp, {a: 10})

  obj = new SubClass()
  // pre test
  test.strictEqual(obj.superProp.c, 30)
  test.strictEqual(obj.prop.d, 40)
  test.deepEqual(obj, {prop: {d: 40}, superProp: {c: 30}})
  test.strictEqual(typeof obj.superFun, 'function')
  test.strictEqual(obj.superFun.length, 1)
  test.strictEqual(typeof obj.fun, 'function')
  test.strictEqual(obj.fun.length, 2)
  obj = {x: obj}

  // test
  appendInPlace('x.superProp', {ccc: 3000}, obj)
  appendInPlace('x.prop', {ddd: 4000}, obj)
  appendInPlace('x.superFun', {length: 10}, obj)
  test.deepEqual(obj.x, {
    superProp: {c: 30, ccc: 3000},
    prop: {d: 40, ddd: 4000},
    superFun: {length: 10},
  })
  test.strictEqual(typeof obj.x.superFun, 'object')
  test.strictEqual(typeof obj.x.fun, 'function')

  test.done()
}

export function test_appendInPlaceBlankPaths(test:Test) {
  let obj = {a: {b: 10}}
  test.throws(() => appendInPlace('', {}, obj), Error)//, 'Deny path piece afer ""')
  test.throws(() => appendInPlace('a..b', {}, obj), Error)//, 'Deny empty path piece after "a"')
  test.throws(() => appendInPlace('a.b.', {}, obj), Error)//, 'Deny empty path piece after "a.b"')
  test.throws(() => appendInPlace('a', {'': 4}, obj), Error)//, 'Deny appending under an empty field')
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

