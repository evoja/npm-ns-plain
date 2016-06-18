'use strict'
import tl from '../test-lib'
const {escapeKey, unescapeKey, indexOfPeriod, lastIndexOfPeriod} = tl.require('keys.js')

export function test_escape(test) {
  const t = (str, expected, message) => test.equal(escapeKey(str), expected, message)
  t('.', '\\.')
  t('\\.', '\\\\\\.')
  t('\\\\\\.', '\\\\\\\\\\\\\\.')
  test.done()
}

export function test_unescape(test) {
  const t = (str, expected, message) => test.equal(unescapeKey(str), expected, message)
  t('\\.', '.')
  t('\\\\\\.', '\\.')
  t('\\\\\\\\\\\\\\.', '\\\\\\.')
  t('\\\\\\', '\\\\')
  test.done()
}

export function test_indexOfPeriod(test) {
  const t = (str, start, expected, message) => test.equal(indexOfPeriod(str, start), expected, message)
  t('\\.', undefined, -1)
  t('.\\\\.', undefined, 0)
  t('\\.\\..\\.\\\\.\\', undefined, 4)
  t('\\.\\..\\.\\\\.\\', 4, 4)
  t('\\.\\..\\.\\\\.\\', 5, 9)
  t('\\.\\..\\.\\\\.\\', 9, 9)
  t('\\.\\..\\.\\\\.\\', 10, -1)
  test.done()
}



export function test_lastIndexOfPeriod(test) {
  const t = (str, start, expected, message) => test.equal(lastIndexOfPeriod(str, start), expected, message)
  t('\\.', undefined, -1)
  t('.\\\\.', undefined, 3)
  t('\\.\\..\\.\\\\.\\', undefined, 9)
  t('\\.\\..\\.\\\\.\\', 9, 9)
  t('\\.\\..\\.\\\\.\\', 8, 4)
  t('\\.\\..\\.\\\\.\\', 4, 4)
  t('\\.\\..\\.\\\\.\\', 3, -1)
  test.done()
}
