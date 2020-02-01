'use strict';

import {namespace, assign, access, testingPurposes,
  assignInPlace, appendInPlace} from '../../src/ns'
const {setMockIsBrowser} = testingPurposes

declare const global:any
declare const window:any

test('assign', () => {
  expect.assertions(9)
  let obj:any = {a: {b: 1, c: 2}, d: {e: 3}}
  let origObj:any = {a: {b: 1, c: 2}, d: {e: 3}}
  let result = assign('a.b', obj, 100)

  expect(result).toEqual(
    {
      a: {
        b: 100,
        c: 2
      },
      d: {e: 3}
    })
  expect(obj).toEqual(origObj)
  expect(result).not.toEqual(origObj)
  expect(obj.d).toBe(result.d)
  expect(obj).not.toBe(result)

  obj = {}
  origObj = {}
  result = assign('a.b', obj, 100)
  expect(result).toEqual({a: {b: 100}})
  expect(obj).toEqual(origObj)
  expect(result).not.toEqual(origObj)
  expect(obj).not.toBe(result)
})

test('access', () => {
  expect.assertions(3)
  expect(access('a.b', {a: {b: 1, c: 2}})).toBe(1)

  const obj = {}
  const res = access('a.b', obj)
  expect(typeof res).toBe('undefined')
  expect(obj).toEqual({})
})

test('namespace', () => {
  const obj = {}
  const res2 = namespace('a.b', obj)
  expect(typeof res2).toBe('object')
  expect(res2).toEqual({})
  expect(obj).toEqual({a: {b: {}}})
})

test('namespace (server)', () => {
  // expect.assertions(8)
  if(typeof window !== 'undefined') {
    // it's a browser
    return
  }

  expect(global.a).toBeUndefined()
  expect(() => namespace('a.b')).toThrow(Error)
  expect(global.a).toBeUndefined()

  setMockIsBrowser(true)
  const result = namespace('a.b')
  expect(global.a).toEqual({b: {}})
  expect(result).toBe(global.a.b)
  delete global.a
  setMockIsBrowser(false)

  expect(global.a).toBeUndefined()
  expect(() => namespace('a.b')).toThrow(Error)
  expect(global.a).toBeUndefined()
})


test('namespace (browser)', () => {
  // expect.assertions(0)
  if(typeof window === 'undefined') {
    // it's not a browser
    return
  }
  expect(window.a).toBeUndefined()
  const result = namespace('a.b')
  expect(window.a).toEqual({b: {}})
  expect(result).toBe(window.a.b)
  delete window.a
  expect(window.a).toBeUndefined()
})


test('assignInPlace', () => {
  expect.assertions(6)
  let obj:any = {a: {b: 1, c: 2}, d: {e: 3}}
  let origObj:any = {a: {b: 1, c: 2}, d: {e: 3}}
  let result = assignInPlace('a.b', 100, obj)

  expect(result).toBe(undefined)
  expect(obj).toEqual(
    {
      a: {
        b: 100,
        c: 2
      },
      d: {e: 3}
    })
  expect(obj).not.toEqual(origObj)

  obj = {}
  origObj = {}
  result = assignInPlace('a.b', 100, obj)
  expect(result).toBe(undefined)
  expect(obj).toEqual({a: {b: 100}})
  expect(obj).not.toEqual(origObj)
})

test('appendInPlace', () => {
  expect.assertions(6)
  let obj:any = {a: {b: {x: 1, y: 2}, c: 2}, d: {e: 3}}
  let origObj:any = {a: {b: {x: 1, y: 2}, c: 2}, d: {e: 3}}
  let result = appendInPlace('a.b', {y: 20, z: 30}, obj)

  expect(result).toBe(undefined)
  expect(obj).toEqual(
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
  expect(obj).not.toEqual(origObj)

  obj = {}
  origObj = {}
  result = appendInPlace('a.b', {y: 20, z: 30}, obj)
  expect(result).toBe(undefined)
  expect(obj).toEqual({a: {b: {y: 20, z: 30}}})
  expect(obj).not.toEqual(origObj)
})

