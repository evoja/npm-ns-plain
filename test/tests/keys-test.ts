'use strict'
import {escapeKey, unescapeKey, indexOfPeriod, lastIndexOfPeriod} from '../../src/keys'

type F = (str:string, expected:string) => void
type G = (str:string, start: number|undefined, expected:number) => void

test('escape', () => {
  expect.assertions(3)
  const t:F = (str, expected) => expect(escapeKey(str)).toBe(expected)
  t('.', '\\.')
  t('\\.', '\\\\\\.')
  t('\\\\\\.', '\\\\\\\\\\\\\\.')
})

test('unescape', () => {
  expect.assertions(4)
  const t:F = (str, expected) => expect(unescapeKey(str)).toBe(expected)
  t('\\.', '.')
  t('\\\\\\.', '\\.')
  t('\\\\\\\\\\\\\\.', '\\\\\\.')
  t('\\\\\\', '\\\\')
})

test('indexOfPeriod', () => {
  expect.assertions(7)
  const t:G = (str, start, expected) => expect(indexOfPeriod(str, start)).toBe(expected)
  t('\\.', undefined, -1)
  t('.\\\\.', undefined, 0)
  t('\\.\\..\\.\\\\.\\', undefined, 4)
  t('\\.\\..\\.\\\\.\\', 4, 4)
  t('\\.\\..\\.\\\\.\\', 5, 9)
  t('\\.\\..\\.\\\\.\\', 9, 9)
  t('\\.\\..\\.\\\\.\\', 10, -1)
})

test('lastIndexOfPeriod', () => {
  expect.assertions(7)
  const t:G = (str, start, expected) => expect(lastIndexOfPeriod(str, start)).toBe(expected)
  t('\\.', undefined, -1)
  t('.\\\\.', undefined, 3)
  t('\\.\\..\\.\\\\.\\', undefined, 9)
  t('\\.\\..\\.\\\\.\\', 9, 9)
  t('\\.\\..\\.\\\\.\\', 8, 4)
  t('\\.\\..\\.\\\\.\\', 4, 4)
  t('\\.\\..\\.\\\\.\\', 3, -1)
})
