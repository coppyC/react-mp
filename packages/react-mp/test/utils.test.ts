import { goto } from "../utils";

describe('goto 测试', () => {
  const current = 'a.b.c'
  test('前进一级目录', () => {
    expect(goto(current, 'd'))
      .toBe('a.b.c.d')
  })
  test('返回一级目录', () => {
    expect(goto(current, '../'))
      .toBe('a.b')
  })
  test('去兄弟目录', () => {
    expect(goto(current, '../d'))
      .toBe('a.b.d')
  })
  test('当前目录为空', () => {
    expect(goto('', 'a'))
      .toBe('a')
  })
  test('只有一级目录并返回', () => {
    expect(goto('x', '../'))
      .toBe('')
  })
  test('空目录时返回', () => {
    expect(goto('', '../'))
      .toBe('')
  })
})
