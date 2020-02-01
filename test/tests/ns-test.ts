'use strict'
// TODO: check throw messages
import {namespace, access, assign, assignInPlace, appendInPlace,
    testingPurposes,
} from '../../src/ns'
const {setMockIsBrowser} = testingPurposes
declare const global:any
declare const window:any

test('namespace', () => {
  expect.assertions(6)
  let obj:any = {}
  const x = namespace('a.b', obj)
  expect(obj).toEqual({a:{b:{}}}) //, 'Should create nested objects')
  expect(obj.a.b).toBe(x) //, 'Lowest attached object in the hierarchy should be returned')

  let z = obj.a
  const y = namespace('a', obj)
  expect(y).toBe(z) //, 'Should return existing object')
  expect(y).toBe(obj.a) //, 'Should not recreate existing object')

  obj = {}
  z = namespace('a.b\\.\\\\.d', obj)
  expect(obj).toEqual({a:{'b.\\':{d: {}}}})
  expect(obj.a['b.\\'].d).toBe(z)
})

test('namespace to context', () => {
  expect.assertions(4)
  const obj:any = {m: {n: 3}}
  const x:any = namespace('a.b.c', obj)
  x.d = 5
  const y:any = namespace('a.b.c', obj)
  expect(x).toBe(y) //, 'vars x and y must be the same object')
  expect(y.d).toBe(5) //, 'vars x and y must be the same object')
  expect(obj.a.b.c.d).toBe(5) //, 'namespace must be appended to context')

  const z:any = namespace('m', obj)
  expect(z.n).toBe(3) //, 'must return existing object')
})

test('namespace requires browser (server)', () => {
  //expect.assertions(1)
  if (typeof window !== 'undefined') {
    // we are in browser. do nothing
    return
  }
  expect(() => namespace('a.b.c')).toThrow(Error)//, 'must require browser or context')
})

test('namespace works with mockIsBrowser (server)', () => {
  //expect.assertions(2)
  if (typeof window !== 'undefined') {
    // we are in browser. do nothing
    return
  }

  setMockIsBrowser(true);
  expect(global.a).toBeUndefined()
  const x:any = namespace('a.b.c')
  x.d = 5;
  expect(global.a.b.c.d).toBe(5) // , 'namespace must be appended to global');
  delete global['a'];
  setMockIsBrowser(false);
})

test('namespace worksInBrowser (browser)', () => {
  // expect.assertions(0)
  if (typeof window === 'undefined') {
    // we are in node. do nothing
    return
  }

  expect(window.a).toBeUndefined()
  const x:any = namespace('a.b.c')
  x.d = 5;
  expect(window.a.b.c.d).toBe(5) //, 'namespace must be appended to window');
  delete window['a'];
})

test('namespace does not corrupt arrays', () => {
  expect.assertions(20)
  const obj:any = {a: [1, {b: {c: 5}}]}
  const x = namespace('a', obj)
  expect(Array.isArray(x)).toBe(true)
  const y = namespace('a.0', obj)
  expect(y).toBe(1)
  expect(Array.isArray(obj.a)).toBe(true)
  const z = namespace('a.1', obj)
  expect(z).toBe(obj.a[1])
  expect(Array.isArray(obj.a)).toBe(true)
  const u = namespace('a.1.b', obj)
  expect(u).toBe(obj.a[1].b)
  expect(Array.isArray(obj.a)).toBe(true)
  const v = namespace('a.2', obj)
  expect(v).toBe(obj.a[2])
  expect(typeof v).toBe('object')
  expect(v).toEqual({})
  expect(Array.isArray(obj.a)).toBe(true)
  const w = namespace('a.3.c.d', obj)
  expect(w).toBe(obj.a[3].c.d)
  expect(typeof w).toBe('object')
  expect(v).toEqual({})
  expect(Array.isArray(obj.a)).toBe(true)

  expect(() => namespace('a.b', obj)).toThrow(TypeError)
  expect(() => namespace('a.c.d.e', obj)).toThrow(TypeError)
  expect(namespace('a.length', obj)).toBe(4)
  expect(Array.isArray(obj.a)).toBe(true)

  expect(obj.a).toEqual([ 1, { b: { c: 5 } }, {}, { c: { d: {} } } ])
})

test('namespace for primitives', () => {
  expect.assertions(24)
  const obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str: 'hello',
    nl: null,
    un: undefined
  }
  expect(typeof obj.un).toBe('undefined')
  expect(obj.nl).toBeNull()

  expect(typeof namespace('num', obj)).toBe('number')
  expect(namespace('num', obj)).toBe(1)
  // test.strictEqual(typeof namespace('bgnt', obj), 'bigint')
  // test.strictEqual(typeof namespace('sym', obj), 'symbol')
  expect(typeof namespace('bool', obj)).toBe('boolean')
  expect(namespace('bool', obj)).toBe(false)
  expect(typeof namespace('str', obj)).toBe('string')
  expect(namespace('str', obj)).toBe('hello')
  expect(typeof namespace('nl', obj)).toBe('object')
  expect(namespace('nl', obj)).toEqual({})
  expect(typeof namespace('un', obj)).toBe('object')
  expect(namespace('un', obj)).toEqual({})
  expect(typeof namespace('str.length', obj)).toBe('number')
  expect(namespace('str.length', obj)).toBe(5)

  expect(obj.nl).toEqual({})
  expect(typeof obj.un).toBe('object')
  obj.nl = undefined
  obj.un = undefined

  expect(() => namespace('num.a', obj)).toThrow(TypeError)
  // test.throws(() => namespace('bgnt.a', obj), TypeError)
  // test.throws(() => namespace('sym.a', obj), TypeError)
  expect(() => namespace('bool.a', obj)).toThrow(TypeError)
  expect(() => namespace('str.a', obj)).toThrow(TypeError)
  const nl = namespace('nl.b', obj)
  const un = namespace('un.c', obj)
  expect(nl).toEqual({})
  expect(obj.nl.b).toBe(nl)
  expect(un).toEqual({})
  expect(obj.un.c).toBe(un)
  expect(obj).toEqual({num: 1, bool: false, str:'hello', nl: {b:{}}, un: {c:{}}})
})

test('namespace for functions', () => {
  expect.assertions(8)
  const obj:any = {
    sum: (a:number, b:number) => a + b,
  }

  expect(typeof namespace('sum', obj)).toBe('function')
  expect(namespace('sum', obj)).toBe(obj.sum)
  expect(typeof namespace('sum.name', obj)).toBe('string')
  expect(namespace('sum.name', obj)).toBe('sum')
  expect(typeof namespace('sum.length', obj)).toBe('number')
  expect(namespace('sum.length', obj)).toBe(2)
  expect(() => namespace('sum.bind', obj)).toThrow(TypeError)
  expect(() => namespace('sum.a', obj)).toThrow(TypeError)
})

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

test('namespace for prototypes', () => {
  expect.assertions(22)
  let obj:any = new (SomeConstructor as any)()
  const superProp = obj.superProp

  // pre test
  expect(obj.superProp.a).toBe(10)
  expect(obj.superProp).toEqual({a: 10})
  // test
  expect(namespace('prop.b', obj)).toBe(20)
  expect(typeof namespace('prop.c', obj)).toBe('object')
  expect(obj).toEqual({prop: {b: 20, c: {}}})
  expect(typeof namespace('superProp', obj)).toBe('object')
  expect(obj).toEqual({prop: {b: 20, c: {}}, superProp: {}})
  expect(obj.superProp).not.toBe(superProp)
  expect(typeof namespace('superProp.a', obj)).toBe('object')
  expect(obj).toEqual({prop: {b: 20, c: {}}, superProp: {a: {}}})

  obj = new SubClass()
  // pre test
  expect(obj.superProp.c).toBe(30)
  expect(obj.prop.d).toBe(40)
  expect(obj).toEqual({prop: {d: 40}, superProp: {c: 30}})
  expect(typeof obj.superFun).toBe('function')
  expect(obj.superFun.length).toBe(1)
  expect(typeof obj.fun).toBe('function')
  expect(obj.fun.length).toBe(2)

  // test
  expect(namespace('superProp.c', obj)).toBe(30)
  expect(namespace('prop.d', obj)).toBe(40)
  expect(typeof namespace('superFun.length', obj)).toBe('object')
  expect(typeof namespace('fun', obj)).toBe('object')
  expect(obj).toEqual({
    superProp: {c: 30},
    prop: {d: 40},
    superFun: {length: {}},
    fun: {},
  })
})

test('namespace blank paths', () => {
  expect.assertions(3)
  const obj = {a: {b: 10}}
  expect(() => namespace('', obj)).toThrow(Error)//, 'Deny path piece afer ""')
  expect(() => namespace('a..b', obj)).toThrow(Error)//, 'Deny empty path piece after "a"')
  expect(() => namespace('a.b.', obj)).toThrow(Error)//, 'Deny empty path piece after "a.b"')
})

test('access', () => {
  expect.assertions(6)
  let obj = {}
  let z = access('x.y', obj)
  expect(obj).toEqual({})
  expect(z).toBe(undefined)
  expect(access('x.y')).toBe(undefined)

  obj = {a: {'b.\\': {c: 10}}}
  z = access('a.b\\.\\\\.c', obj)
  expect(obj).toEqual({a: {'b.\\': {c: 10}}})
  expect(z).toBe(10)
  expect(access('a.b\\.\\\\.c')).toBe(undefined)
})

test('access does not corrupt arrays', () => {
  expect.assertions(17)
  const obj:any = {a: [1, {b: {c: 5}}]}
  const x = access('a', obj)
  expect(Array.isArray(x)).toBe(true)
  const y = access('a.0', obj)
  expect(y).toBe(1)
  expect(Array.isArray(obj.a)).toBe(true)
  const z = access('a.1', obj)
  expect(z).toBe(obj.a[1])
  expect(Array.isArray(obj.a)).toBe(true)
  const u = access('a.1.b', obj)
  expect(u).toBe(obj.a[1].b)
  expect(Array.isArray(obj.a)).toBe(true)
  const v = access('a.2', obj)
  expect(v).toBe(undefined)
  expect(Array.isArray(obj.a)).toBe(true)
  const w = access('a.3.c.d', obj)
  expect(w).toBe(undefined)
  expect(Array.isArray(obj.a)).toBe(true)

  const r = access('a.b', obj) as any
  expect(r).toBe(undefined)
  expect(Array.isArray(obj.a)).toBe(true)

  const t = access('a.c.d.e', obj)
  expect(t).toBe(undefined)
  expect(Array.isArray(obj.a)).toBe(true)

  const s = access('a.length', obj) as any
  expect(s).toBe(2)
  expect(Array.isArray(obj.a)).toBe(true)
})

test('access for primitives', () => {
  expect.assertions(18)
  const obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  expect(typeof access('num', obj)).toBe('number')
  expect(access('num', obj)).toBe(1)
  // expect(typeof access('bgnt', obj)).toBe('bigint')
  // expect(typeof access('sym', obj)).toBe('symbol')
  expect(typeof access('bool', obj)).toBe('boolean')
  expect(access('bool', obj)).toBe(false)
  expect(typeof access('str', obj)).toBe('string')
  expect(access('str', obj)).toBe('hello')
  expect(typeof access('nl', obj)).toBe('object')
  expect(access('nl', obj)).toBe(null)
  expect(typeof access('un', obj)).toBe('undefined')
  expect(access('un', obj)).toBe(undefined)
  expect(typeof access('str.length', obj)).toBe('number')
  expect(access('str.length', obj)).toBe(5)

  expect(access('num.a', obj)).toBe(undefined)
  // expect(access('bgnt.a', obj)).toBe(undefined)
  // expect(access('sym.a', obj)).toBe(undefined)
  expect(access('bool.a', obj)).toBe(undefined)
  expect(access('str.a', obj)).toBe(undefined)
  expect(access('nl.b', obj)).toBe(undefined)
  expect(access('un.c', obj)).toBe(undefined)
  expect(obj).toEqual({num: 1, bool: false, str:'hello', nl: null, un: undefined})
})

test('acces for functions', () => {
  expect.assertions(8)
  const obj:any = {
    sum: (a:number, b:number) => a + b,
  }

  expect(typeof access('sum', obj)).toBe('function')
  expect(access('sum', obj)).toBe(obj.sum)
  expect(typeof access('sum.name', obj)).toBe('string')
  expect(access('sum.name', obj)).toBe('sum')
  expect(typeof access('sum.length', obj)).toBe('number')
  expect(access('sum.length', obj)).toBe(2)
  expect(access('sum.bind', obj)).toBe(undefined)
  expect(access('sum.a', obj)).toBe(undefined)
})

test('access for prototypes', () => {
  expect.assertions(19)
  let obj:any = new (SomeConstructor as any)()

  // pre test
  expect(obj.superProp.a).toBe(10)
  expect(obj.superProp).toEqual({a: 10})
  // test
  expect(access('prop.b', obj)).toBe(20)
  expect(access('superProp.a', obj)).toBe(undefined)
  expect(access('superProp', obj)).toBe(undefined)
  expect(obj).toEqual({prop: {b: 20}})

  obj = new SubClass()
  // pre test
  expect(obj.superProp.c).toBe(30)
  expect(obj.prop.d).toBe(40)
  expect(obj).toEqual({prop: {d: 40}, superProp: {c: 30}})
  expect(typeof obj.superFun).toBe('function')
  expect(obj.superFun.length).toBe(1)
  expect(typeof obj.fun).toBe('function')
  expect(obj.fun.length).toBe(2)

  // test
  expect(access('superProp.c', obj)).toBe(30)
  expect(access('prop.d', obj)).toBe(40)
  expect(access('superFun.length', obj)).toBe(undefined)
  expect(access('superFun', obj)).toBe(undefined)
  expect(access('fun', obj)).toBe(undefined)
  expect(obj).toEqual({
    superProp: {c: 30},
    prop: {d: 40},
  })
})

test('access blank paths', () => {
  expect.assertions(3)
  const obj = {a: {b: 10}}
  expect(() => access('', obj)).toThrow(Error)//, 'Deny path piece afer ""')
  expect(() => access('a..b', obj)).toThrow(Error)//, 'Deny empty path piece after "a"')
  expect(() => access('a.b.', obj)).toThrow(Error)//, 'Deny empty path piece after "a.b"')
})

test('assign', () => {
  expect.assertions(11)
  const obj:any = {m: 1, n: 1, o: [1, 2, 3]}
  expect({m: 2, n: 1, o: [1, 2, 3]}).toEqual(assign('m', obj, 2))
  expect(obj).toEqual({m: 1, n: 1, o: [1, 2, 3]}) //, 'obj must not be changed')

  const result:any = assign('o.1', obj, 20)
  expect(result).toEqual({m: 1, n: 1, o: [1, 20, 3]})
  expect(Array.isArray(result.o)).toBe(true)
  expect(obj).toEqual({m: 1, n: 1, o: [1, 2, 3]}) //, 'obj must not be changed')

  const result1 = assign('l', obj, 2)
  expect(result1).toEqual({m: 1, l: 2, n: 1, o: [1, 2, 3]})
  expect(obj).toEqual({m: 1, n: 1, o: [1, 2, 3]}) //, 'obj must not be changed')
  expect(result1.l).toBe(2)


  const result2 = assign('n\\..k.c', obj, 2)
  expect(result2).toEqual({m: 1, 'n.': {k: {c: 2}}, n: 1, o: [1, 2, 3]})
  expect(obj).toEqual({m: 1, n: 1, o: [1, 2, 3]}) //, 'obj must not be changed')
  expect(result2['n.'].k.c).toBe(2)
})

test('assign does not corrupt arrays', () => {
  expect.assertions(25)
  const obj:any = {a: [1, {b: {c: 5}}]}

  let res:any = assign('a', obj, 10)
  expect(res.a).toBe(10)

  res = assign('a.0', obj, 10)
  expect(res.a[0]).toBe(10)
  expect(Array.isArray(res.a)).toBe(true)
  expect(Array.isArray(obj.a)).toBe(true)

  res = assign('a.1', obj, 10)
  expect(res.a[1]).toBe(10)
  expect(Array.isArray(res.a)).toBe(true)
  expect(Array.isArray(obj.a)).toBe(true)

  res = assign('a.1.b', obj,10)
  expect(res.a[1].b).toBe(10)
  expect(Array.isArray(res.a)).toBe(true)
  expect(Array.isArray(obj.a)).toBe(true)

  res = assign('a.2', obj, undefined)
  expect(res.a[2]).toBe(undefined)
  expect(Array.isArray(res.a)).toBe(true)
  expect(Array.isArray(obj.a)).toBe(true)

  res = assign('a.2', obj, 10)
  expect(res.a[2]).toBe(10)
  expect(Array.isArray(res.a)).toBe(true)
  expect(Array.isArray(obj.a)).toBe(true)

  res = assign('a.3.c.d', obj, 10)
  expect(res.a[3].c.d).toBe(10)
  expect(Array.isArray(res.a)).toBe(true)
  expect(Array.isArray(obj.a)).toBe(true)

  expect(() => assign('a.b', obj, 10)).toThrow(TypeError)
  expect(Array.isArray(obj.a)).toBe(true)

  expect(() => assign('a.c.d.e', obj, 10)).toThrow(TypeError)
  expect(Array.isArray(obj.a)).toBe(true)

  expect(() => assign('a.length', obj, 10)).toThrow(TypeError)
  expect(Array.isArray(obj.a)).toBe(true)
})

test('assign for primitives', () => {
  expect.assertions(12)
  const obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hi',
    nl: null,
    un: undefined
  }

  expect(assign('num', obj, 2).num).toBe(2)
  // expect(typeof assign('bgnt', obj), 'bigint')
  // expect(typeof assign('sym', obj), 'symbol')
  expect(assign('bool', obj, true).bool).toBe(true)
  expect(assign('str', obj, 'goodbye').str).toBe('goodbye')
  expect(assign('nl', obj, 'some').nl).toBe('some')
  expect(assign('un', obj, 'other').un).toBe('other')

  expect(() => assign('num.a', obj, 1)).toThrow(TypeError)
  // expect(() => assign('bgnt.a', obj)).toThrow(TypeError)
  // expect(() => assign('sym.a', obj)).toThrow(TypeError)
  expect(() => assign('bool.b', obj, 2)).toThrow(TypeError)
  expect(() => assign('str.c', obj, 3)).toThrow(TypeError)
  expect(() => assign('str.1', obj, 'o')).toThrow(TypeError)
  expect(() => assign('str.length', obj, 10).str).toThrow(TypeError)
  expect(assign('nl.d', obj, 4).nl).toEqual({d:4})
  expect(assign('un.e', obj, 5).un).toEqual({e:5})
})

test('assign for functions', () => {
  expect.assertions(5)
  const obj:any = {
    sum: (a:number, b:number) => a + b,
  }

  expect(assign('sum', obj, 1).sum).toBe(1)
  expect(() => assign('sum.name', obj, 'hello')).toThrow(TypeError)
  expect(() => assign('sum.length', obj, 10)).toThrow(TypeError)
  expect(() => assign('sum.bind', obj, ()=>{})).toThrow(TypeError)
  expect(() => assign('sum.a', obj, 4)).toThrow(TypeError)
})

test('assign for prototypes', () => {
  expect.assertions(21)
  let obj:any = new (SomeConstructor as any)()

  // pre test
  expect(obj.superProp.a).toBe(10)
  expect(obj.superProp).toEqual({a: 10})
  // test
  expect(assign('prop.b', obj, 200).prop.b).toBe(200)
  expect(assign('prop.bbb', obj, 2000).prop.b).toBe(20)
  expect(assign('superProp.a', obj, 100).superProp.a).toBe(100)
  expect(assign('superProp.aaa', obj, 1000).superProp.a).toBe(undefined)
  const x = assign('prop.c', assign('superProp.d', obj, 'dd'), 'cc')
  expect(x).toEqual({prop: {b: 20, c: 'cc'}, superProp: {d: 'dd'}})

  obj = new SubClass()
  // pre test
  expect(obj.superProp.c).toBe(30)
  expect(obj.prop.d).toBe(40)
  expect(obj).toEqual({prop: {d: 40}, superProp: {c: 30}})
  expect(typeof obj.superFun).toBe('function')
  expect(obj.superFun.length).toBe(1)
  expect(typeof obj.fun).toBe('function')
  expect(obj.fun.length).toBe(2)

  // test
  expect(assign('superProp.c', obj, 300).superProp.c).toBe(300)
  expect(assign('superProp.ccc', obj, 3000).superProp.c).toBe(30)
  expect(assign('prop.d', obj, 400).prop.d).toBe(400)
  expect(assign('prop.ddd', obj, 4000).prop.d).toBe(40)
  expect(assign('superFun.length', obj, 10).superFun.length).toBe(10)
  expect(assign('superFun', obj, 20).superFun).toBe(20)
  expect(assign('fun', obj, 30).fun).toBe(30)
})

test('assign blank paths', () => {
  expect.assertions(3)
  const obj = {a: {b: 10}}
  expect(() => assign('', obj, 10)).toThrow(Error)//, 'Deny path piece afer ""')
  expect(() => assign('a..b', obj, 10)).toThrow(Error)//, 'Deny empty path piece after "a"')
  expect(() => assign('a.b.', obj, 10)).toThrow(Error)//, 'Deny empty path piece after "a.b"')
})


test('assignInPlace', () => {
  expect.assertions(4)
  const obj:any = {}
  assignInPlace('a.b.c', 10, obj)
  expect(obj.a.b.c).toBe(10)
  assignInPlace('a.b.c', 20, obj)
  expect(obj.a.b.c).toBe(20)
  assignInPlace('k.m\\..n', 30, obj)
  expect(obj.k['m.'].n).toBe(30)
  expect(obj).toEqual({a: {b: {c: 20}}, k: {'m.': {n: 30}}})
})

test('assignInPlace does not corrupt arrays', () => {
  expect.assertions(20)
  let obj:any = {a: [1, {b: {c: 5}}]}
  assignInPlace('a', 10, obj)
  expect(obj.a).toBe(10)

  assignInPlace('a', undefined, obj)
  expect(obj.a).toBe(undefined)

  obj = {a: [1, {b: {c: 5}}]}
  assignInPlace('a.0', 10, obj)
  expect(obj.a[0]).toBe(10)
  expect(Array.isArray(obj.a)).toBe(true)

  assignInPlace('a.1', 10, obj)
  expect(obj.a[1]).toBe(10)
  expect(Array.isArray(obj.a)).toBe(true)

  obj = {a: [1, {b: {c: 5}}]}
  assignInPlace('a.1.b', 10, obj)
  expect(obj.a[1].b).toBe(10)
  expect(Array.isArray(obj.a)).toBe(true)

  assignInPlace('a.2', undefined, obj)
  expect(obj.a[2]).toBe(undefined)
  expect(Array.isArray(obj.a)).toBe(true)

  assignInPlace('a.2', 10, obj)
  expect(obj.a[2]).toBe(10)
  expect(Array.isArray(obj.a)).toBe(true)

  assignInPlace('a.3.c.d', 10, obj)
  expect(obj.a[3].c.d).toBe(10)
  expect(Array.isArray(obj.a)).toBe(true)


  expect(() => assignInPlace('a.b', 10, obj)).toThrow(TypeError)
  expect(Array.isArray(obj.a)).toBe(true)

  expect(() => assignInPlace('a.c.d.e', 10, obj)).toThrow(TypeError)
  expect(Array.isArray(obj.a)).toBe(true)

  expect(() => assignInPlace('a.length', 10, obj)).toThrow(TypeError)
  expect(Array.isArray(obj.a)).toBe(true)
})

test('assignInPlace for primitives', () => {
  expect.assertions(17)
  let obj:any = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }
  expect(typeof obj.un).toBe('undefined')
  expect(obj.nl).toBeNull()

  assignInPlace('num', 2, obj)
  expect(obj.num).toBe(2)
  // expect(typeof assignInPlace('bgnt', obj)).toBe('bigint')
  // expect(typeof assignInPlace('sym', obj)).toBe('symbol')
  assignInPlace('bool', true, obj)
  expect(obj.bool).toBe(true)
  assignInPlace('str', 'goodbye', obj)
  expect(obj.str).toBe('goodbye')
  assignInPlace('nl', 'some', obj)
  expect(obj.nl).toBe('some')
  assignInPlace('un', 'other', obj)
  expect(obj.un).toBe('other')
  expect(() => assignInPlace('str.length', 10, obj)).toThrow(TypeError)

  expect(obj).toEqual({
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

  expect(() => assignInPlace('num.a', 1, obj)).toThrow(TypeError)
  // expect(() => assignInPlace('bgnt.a', obj)).toThrow(TypeError)
  // expect(() => assignInPlace('sym.a', obj)).toThrow(TypeError)
  expect(() => assignInPlace('bool.a', 2, obj)).toThrow(TypeError)
  expect(() => assignInPlace('str.a', 3, obj)).toThrow(TypeError)
  assignInPlace('nl.b', 4, obj)
  assignInPlace('un.c', 5, obj)
  expect(obj.nl).toEqual({b:4})
  expect(obj.nl.b).toBe(4)
  expect(obj.un).toEqual({c:5})
  expect(obj.un.c).toBe(5)
  expect(obj).toEqual({num: 1, bool: false, str:'hello', nl: {b:4}, un: {c:5}})
})

test('assignInPlace for functions', () => {
  expect.assertions(5)
  const obj:any = {
    sum: (a:number, b:number) => a + b,
  }
  const sum = obj.sum

  assignInPlace('sum', 1, obj)
  expect(obj.sum).toBe(1)
  obj.sum = sum
  expect(() => assignInPlace('sum.name', 'hello', obj)).toThrow(TypeError)
  expect(() => assignInPlace('sum.length', 1, obj)).toThrow(TypeError)
  expect(() => assignInPlace('sum.bind', ()=>{}, obj)).toThrow(TypeError)
  expect(() => assignInPlace('sum.a', 1, obj)).toThrow(TypeError)
})

test('assignInPlace prototypes', () => {
  expect.assertions(14)
  let obj:any = new (SomeConstructor as any)()
  const superProp = obj.superProp

  // pre test
  expect(obj.superProp.a).toBe(10)
  expect(obj.superProp).toEqual({a: 10})

  // test
  assignInPlace('prop.bbb', 2000, obj)
  assignInPlace('superProp.aaa', 1000, obj)
  expect(obj).toEqual({prop: {b: 20, bbb: 2000}, superProp: {aaa: 1000}})
  assignInPlace('superProp.a', 100, obj)
  expect(superProp).toEqual({a: 10})

  obj = new SubClass()
  // pre test
  expect(obj.superProp.c).toBe(30)
  expect(obj.prop.d).toBe(40)
  expect(obj).toEqual({prop: {d: 40}, superProp: {c: 30}})
  expect(typeof obj.superFun).toBe('function')
  expect(obj.superFun.length).toBe(1)
  expect(typeof obj.fun).toBe('function')
  expect(obj.fun.length).toBe(2)

  // test
  assignInPlace('superProp.ccc', 3000, obj)
  assignInPlace('prop.ddd', 4000, obj)
  assignInPlace('superFun.length', 10, obj)
  expect(obj).toEqual({
    superProp: {c: 30, ccc: 3000},
    prop: {d: 40, ddd: 4000},
    superFun: {length: 10},
  })
  expect(typeof obj.superFun).toBe('object')
  expect(typeof obj.fun).toBe('function')
})

test('assignInPlace blank paths', () => {
  expect.assertions(3)
  const obj = {a: {b: 10}}
  expect(() => assignInPlace('', 10, obj)).toThrow(Error)//, 'Deny path piece afer ""')
  expect(() => assignInPlace('a..b', 10, obj)).toThrow(Error)//, 'Deny empty path piece after "a"')
  expect(() => assignInPlace('a.b.', 10, obj)).toThrow(Error)//, 'Deny empty path piece after "a.b"')
})

test('assignInPlace (server)', () => {
  // expect.assertions(7)
  if (typeof window !== 'undefined') {
    // it's a browser
    return
  }

  expect(global.a).toBeUndefined()
  expect(() => assignInPlace('a.b.c', 10)).toThrow(Error)
  expect(global.a).toBeUndefined()

  setMockIsBrowser(true)
  assignInPlace('a.b.c', 10)
  expect(global.a.b.c).toBe(10)
  assignInPlace('a.b.c', 20)
  expect(global.a.b.c).toBe(20)
  delete global['a']
  setMockIsBrowser(false)

  expect(() => assignInPlace('a.b.c', 10)).toThrow(Error)
  expect(global.a).toBeUndefined()
})

test('assignInPlace (browser)', () => {
  // expect.assertions(0)
  if (typeof window === 'undefined') {
    // it's not a browser
    return
  }

  expect(window.a).toBeUndefined()
  assignInPlace('a.b.c', 10)
  expect(window.a.b.c).toBe(10)
  assignInPlace('a.b.c', 20)
  expect(window.a.b.c).toBe(20)
  delete window['a']
  expect(window.a).toBeUndefined()
})


test('appendInPlace', () => {
  expect.assertions(10)
  const obj:any = {}
  appendInPlace('a.b.c', {d: 5, e: 10}, obj)
  expect(obj.a.b.c).toEqual({d: 5, e: 10})
  expect(obj.a.b.c).not.toBe({d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30}, obj)
  expect(obj.a.b.c).toEqual({d: 5, e: 20, f: 30})
  expect(obj.a.b.c).not.toBe({d: 5, e: 20, f: 30})
  expect(() => appendInPlace('a.b.c', 30 as any, obj)).toThrow(Error)
  expect(() => appendInPlace('a.b.c.d', {a:5}, obj)).toThrow(Error)
  appendInPlace('a.b.c\\.', {x: 1, y: 2}, obj)
  expect(obj.a.b['c.']).toEqual({x: 1, y: 2})
  expect(obj.a.b['c.']).not.toBe({x: 1, y: 2})
  expect(obj.a.b).toEqual({c: {d: 5, e: 20, f: 30}, 'c.': {x: 1, y: 2}})
  expect(obj.a.b).not.toBe({c: {d: 5, e: 20, f: 30}, 'c.': {x: 1, y: 2}})
})

test('appendInPlace does not corrupt arrays', () => {
  expect.assertions(18)
  let obj:any = {a: [1, {b: {c: 5}}]}
  const x = {a:10}
  expect(() => appendInPlace('a', x, obj)).toThrow(TypeError)
  const y:any = [1, {b: {c: 5}}]
  expect(obj.a).toEqual(y)

  const u = {length:10}
  expect(() => appendInPlace('a', u, obj)).toThrow(TypeError)
  expect(obj.a).toEqual(y)

  appendInPlace('a.1', x, obj)
  expect(obj.a[1]).toEqual({b: {c:5}, a:10})
  expect(Array.isArray(obj.a)).toBe(true)

  obj = {a: [1, {b: {c: 5}}]}
  appendInPlace('a.1.b', x, obj)
  expect(obj.a[1].b).toEqual({a:10, c:5})
  expect(Array.isArray(obj.a)).toBe(true)

  appendInPlace('a.2', x, obj)
  expect(obj.a[2]).toEqual(x)
  expect(Array.isArray(obj.a)).toBe(true)

  appendInPlace('a.3.c.d', x, obj)
  expect(obj.a[3].c.d).toEqual(x)
  expect(Array.isArray(obj.a)).toBe(true)

  const z: any = []
  z[1] = 10;
  appendInPlace('a', z, obj);
  expect(obj.a).toEqual([1, 10, {a:10}, {c: {d: {a: 10}}}])
  expect(Array.isArray(obj.a)).toBe(true)

  appendInPlace('a', [undefined, 20], obj);
  expect(obj.a).toEqual([undefined, 20, {a:10}, {c: {d: {a: 10}}}])
  expect(Array.isArray(obj.a)).toBe(true)

  appendInPlace('a', {'1': 30}, obj);
  expect(obj.a).toEqual([undefined, 30, {a:10}, {c: {d: {a: 10}}}])
  expect(Array.isArray(obj.a)).toBe(true)
})

test('appendInPlace for primitives', () => {
  expect.assertions(25)
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
  expect(typeof obj.x.un).toBe('undefined')
  expect(obj.x.nl).toBe(null)

  // appendInPlace('', {num: 2, bool: true, str: 'goodbye', nl: 4, un: 5}, obj)
  appendInPlace('x', {num: 2, bool: true, str: 'goodbye', nl: 4, un: 5}, obj)
  expect(obj.x.num).toBe(2)
  expect(obj.x.bool).toBe(true)
  expect(obj.x.str).toBe('goodbye')
  expect(obj.x.nl).toBe(4)
  expect(obj.x.un).toBe(5)
  expect(obj).toEqual({x:{num: 2, bool: true, str: 'goodbye', nl: 4, un: 5}})

  obj = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  expect(() => appendInPlace('num', {a:1}, obj)).toThrow(TypeError)
  // expect(typeof appendInPlace('bgnt', obj), 'bigint')
  // expect(typeof appendInPlace('sym', obj), 'symbol')
  expect(() => appendInPlace('bool', {a:1}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('str', {a:1}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('str', {length:1}, obj)).toThrow(TypeError)
  appendInPlace('nl', {a: 1}, obj)
  expect(obj.nl).toEqual({a:1})
  expect(obj.nl.a).toBe(1)
  appendInPlace('un', {b: 2}, obj)
  expect(obj.un).toEqual({b:2})
  expect(obj.un.b).toBe(2)
  expect(obj).toEqual({num: 1, bool: false, str: 'hello', nl:{a:1}, un:{b:2}})

  obj = {
    num: 1,
    // bgnt: 1n,            // bigint is commented because target=es5
    // sym: Symbol('foo'),  // symbol is commented because target=es5
    bool: false,
    str:'hello',
    nl: null,
    un: undefined
  }

  expect(() => appendInPlace('num.a', {a:1}, obj)).toThrow(TypeError)
  // expect(() => appendInPlace('bgnt.a', obj)).toThrow(TypeError)
  // expect(() => appendInPlace('sym.a', obj)).toThrow(TypeError)
  expect(() => appendInPlace('bool.a', {a:1}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('str.a', {a:1}, obj)).toThrow(TypeError)
  appendInPlace('nl.b', {a: 1}, obj)
  expect(obj.nl).toEqual({b:{a:1}})
  expect(obj.nl.b.a).toBe(1)
  appendInPlace('un.c', {b:2},  obj)
  expect(obj.un).toEqual({c:{b:2}})
  expect(obj.un.c.b).toBe(2)
  expect(obj).toEqual({num: 1, bool: false, str:'hello', nl: {b:{a:1}}, un: {c:{b:2}}})
})

test('appendInPlace for functions', () => {
  expect.assertions(9)
  let obj:any = {
    x: {
      sum: (a:number, b:number) => a + b,
    }
  }
  const sum = obj.x.sum

  appendInPlace('x', {sum:1}, obj)
  expect(obj.x.sum).toBe(1)
  obj = obj.x
  obj.sum = sum
  expect(() => appendInPlace('sum', {name: 'hello'}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum', {length: 1}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum', {bind: ()=>{}}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum', {a: 10}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum.name', {a: 10}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum.length', {a: 10}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum.bind', {a: 10}, obj)).toThrow(TypeError)
  expect(() => appendInPlace('sum.a', {a: 10}, obj)).toThrow(TypeError)
})

test('appendInPlace prototypes', () => {
  expect.assertions(14)
  let obj:any = new (SomeConstructor as any)()
  const superProp = obj.superProp

  // pre test
  expect(obj.superProp.a).toBe(10)
  expect(obj.superProp).toEqual({a: 10})
  obj = {x: obj}

  // test
  appendInPlace('x.prop', {bbb: 2000}, obj)
  appendInPlace('x.superProp', {aaa: 1000}, obj)
  expect(obj.x).toEqual({prop: {b: 20, bbb: 2000}, superProp: {aaa: 1000}})
  appendInPlace('x.superProp',{a: 100, aaa: 1}, obj)
  expect(superProp).toEqual({a: 10})

  obj = new SubClass()
  // pre test
  expect(obj.superProp.c).toBe(30)
  expect(obj.prop.d).toBe(40)
  expect(obj).toEqual({prop: {d: 40}, superProp: {c: 30}})
  expect(typeof obj.superFun).toBe('function')
  expect(obj.superFun.length).toBe(1)
  expect(typeof obj.fun).toBe('function')
  expect(obj.fun.length).toBe(2)
  obj = {x: obj}

  // test
  appendInPlace('x.superProp', {ccc: 3000}, obj)
  appendInPlace('x.prop', {ddd: 4000}, obj)
  appendInPlace('x.superFun', {length: 10}, obj)
  expect(obj.x).toEqual({
    superProp: {c: 30, ccc: 3000},
    prop: {d: 40, ddd: 4000},
    superFun: {length: 10},
  })
  expect(typeof obj.x.superFun).toBe('object')
  expect(typeof obj.x.fun).toBe('function')
})

test('appendInPlace blank paths', () => {
  expect.assertions(4)
  const obj = {a: {b: 10}}
  expect(() => appendInPlace('', {}, obj)).toThrow(Error)//, 'Deny path piece afer ""')
  expect(() => appendInPlace('a..b', {}, obj)).toThrow(Error)//, 'Deny empty path piece after "a"')
  expect(() => appendInPlace('a.b.', {}, obj)).toThrow(Error)//, 'Deny empty path piece after "a.b"')
  expect(() => appendInPlace('a', {'': 4}, obj)).toThrow(Error)//, 'Deny appending under an empty field')
})

test('appendInPlace (server)', () => {
  // expect.assertions(7)
  if (typeof window !== 'undefined') {
    // it's a browser
    return
  }

  expect(global.a).toBeUndefined()
  expect(() => appendInPlace('a.b.c', {d: 5, e: 10})).toThrow(Error)
  expect(global.a).toBeUndefined()

  setMockIsBrowser(true)
  appendInPlace('a.b.c', {d: 5, e: 10})
  expect(global.a.b.c).toEqual({d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30})
  expect(global.a.b.c).toEqual({d: 5, e: 20, f: 30})
  delete global['a']
  setMockIsBrowser(false)

  expect(() => appendInPlace('a.b.c', {d: 5, e: 10})).toThrow(Error)
  expect(global.a).toBeUndefined()
})

test('appendInPlace (browser)', () => {
  expect.assertions(0)
  if (typeof window === 'undefined') {
    // it's not a browser
    return
  }

  expect(window.a).toBeUndefined()
  appendInPlace('a.b.c', {d: 5, e: 10})
  expect(window.a.b.c).toEqual({d: 5, e: 10})
  appendInPlace('a.b.c', {e: 20, f: 30})
  expect(window.a.b.c).toEqual({d: 5, e: 20, f: 30})
  delete window['a']
  expect(window.a).toBeUndefined()
})

