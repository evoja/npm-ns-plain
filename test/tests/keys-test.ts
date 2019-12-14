'use strict'
import {escapeKey, unescapeKey, indexOfPeriod, lastIndexOfPeriod} from '../../src/keys'
import {Test} from 'nodeunit'

type F = (str:string, expected:string, message?:string) => void
type G = (str:string, start: number|undefined, expected:number, message?:string) => void

export function test_escape(test:Test) {
  const t:F = (str, expected, message) => test.equal(escapeKey(str), expected, message)
  t('.', '\\.')
  t('\\.', '\\\\\\.')
  t('\\\\\\.', '\\\\\\\\\\\\\\.')
  test.done()
}

export function test_unescape(test:Test) {
  const t:F = (str, expected, message) => test.equal(unescapeKey(str), expected, message)
  t('\\.', '.')
  t('\\\\\\.', '\\.')
  t('\\\\\\\\\\\\\\.', '\\\\\\.')
  t('\\\\\\', '\\\\')
  test.done()
}

export function test_indexOfPeriod(test:Test) {
  const t:G = (str, start, expected, message) => test.equal(indexOfPeriod(str, start), expected, message)
  t('\\.', undefined, -1)
  t('.\\\\.', undefined, 0)
  t('\\.\\..\\.\\\\.\\', undefined, 4)
  t('\\.\\..\\.\\\\.\\', 4, 4)
  t('\\.\\..\\.\\\\.\\', 5, 9)
  t('\\.\\..\\.\\\\.\\', 9, 9)
  t('\\.\\..\\.\\\\.\\', 10, -1)
  test.done()
}



export function test_lastIndexOfPeriod(test:Test) {
  const t:G = (str, start, expected, message) => test.equal(lastIndexOfPeriod(str, start), expected, message)
  t('\\.', undefined, -1)
  t('.\\\\.', undefined, 3)
  t('\\.\\..\\.\\\\.\\', undefined, 9)
  t('\\.\\..\\.\\\\.\\', 9, 9)
  t('\\.\\..\\.\\\\.\\', 8, 4)
  t('\\.\\..\\.\\\\.\\', 4, 4)
  t('\\.\\..\\.\\\\.\\', 3, -1)
  test.done()
}
