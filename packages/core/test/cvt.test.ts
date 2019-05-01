import cvt from "../cvt";

describe('style 对象处理', () => {
  test('不处理字符串', () => {
    const STYLE = 'color:red'
    expect(cvt.style(STYLE)).toBe(STYLE)
  })
  test('多个属性', () => {
    expect(cvt.style({
      color: 'red',
      background: '#fff',
    })).toBe('color:red;background:#fff')
  })
  test('驼峰属性', () => {
    expect(cvt.style({
      marginTop: '3px',
    })).toBe('margin-top:3px')
  })
  test('数字转 rpx', () => {
    expect(cvt.style({
      margin: 3,
    })).toBe('margin:3rpx')
  })
})
