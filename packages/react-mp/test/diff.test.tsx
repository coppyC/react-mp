import diff from "../diff";
import * as React from 'react'
import cvt from "../cvt";

describe('diff 算法', () => {
  test('when 没有变化时 => 返回空对象', () => {
    const createJsx = () =>
      <div>
        <div style={{margin: 10}}>123</div>
        <div hidden>456</div>
      </div>
    const diffResult = diff(createJsx(), createJsx())
    expect(Object.keys(diffResult).length).toBe(0)
  })
  test('when 根元素不同 => 根元素', () => {
    const jsx0 = <div>123</div>
    const jsx1 = <span>123</span>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0)
  })
  test('when style 不同 => style', () => {
    const jsx0 = <div style={{margin: 10}}>123</div>
    const jsx1 = <div>123</div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.style'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(cvt.style(jsx0.props.style))
  })
  test('when props 不同 => prop', () => {
    const jsx0 = <div className="x y">123</div>
    const jsx1 = <div className="x">123</div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.className'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.className)
  })
  test('when children 不同 => children', () => {
    const jsx0 = <div>123</div>
    const jsx1 = <div><span>123</span></div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.children)
  })
  test('when children 都不是 Element 且不同 => children', () => {
    const jsx0 = <div>123</div>
    const jsx1 = <div>345</div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.children)
  })
  test('when children 是 Element 不同 => children', () => {
    const jsx0 = <div><div>123</div></div>
    const jsx1 = <div><span>123</span></div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.children)
  })
  test('when children 是 Element[]  长度不同 => children[]', () => {
    const jsx0 = (
      <div>
        <div>123</div>
        <div>123</div>
      </div>
    )
    const jsx1 = (
      <div>
        <div>123</div>
        <div>123</div>
        <div>123</div>
      </div>
    )
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.children)
  })
  test('when children 是 Element[]，其中一个 chil 不一样', () => {
    const jsx0 = (
      <div>
        <span>123</span>
        <div>123</div>
      </div>
    )
    const jsx1 = (
      <div>
        <div>123</div>
        <div>123</div>
      </div>
    )
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children[0]'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.children[0])
  })
  test('when children 是 Element[]，其中一个 chil的 children 不一样', () => {
    const jsx0 = (
      <div>
        <div>???</div>
        <div>123</div>
      </div>
    )
    const jsx1 = (
      <div>
        <div>123</div>
        <div>123</div>
      </div>
    )
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children[0].props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe(jsx0.props.children[0].props.children)
  })
  test('when 叶子children 不同', () => {
    const jsx0 = <div><div><div>123</div></div></div>
    const jsx1 = <div><div><div>456</div></div></div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children.props.children.props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe('123')
  })
  test('&& 运算符测试', () => {
    const jsx0 = <div>{false && <div>123</div>}</div>
    const jsx1 = <div>{true && <div>123</div>}</div>
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    const expectKey = 'root.props.children'
    expect(diffKeys.length).toBe(1)
    expect(diffKeys.includes(expectKey)).toBeTruthy
    expect(diffResult[expectKey]).toBe('')
  })
  test('默认属性为 true', () => {
    // https://react.docschina.org/docs/jsx-in-depth.html#%E5%B1%9E%E6%80%A7%E9%BB%98%E8%AE%A4%E4%B8%BAtrue
    // 两者等价，对比结果为空
    const jsx0 = <div hidden />
    const jsx1 = <div hidden={true} />
    const diffResult = diff(jsx0, jsx1, 'root')
    const diffKeys = Object.keys(diffResult)
    expect(diffKeys.length).toBe(0)
  })
  test('忽略 布尔值、null 和 undefined', () => {
    const jsx0 = <div />
    let diffResult, diffKeys
    const run = (jsx1) => {
      diffResult = diff(jsx0, jsx1, 'root')
      diffKeys = Object.keys(diffResult)
      expect(diffKeys.length).toBe(0)
    }
    // 下面各种写法与 <div /> 等价
    // https://react.docschina.org/docs/jsx-in-depth.html#%E5%B8%83%E5%B0%94%E5%80%BC%E3%80%81null-%E5%92%8C-undefined-%E8%A2%AB%E5%BF%BD%E7%95%A5
    run(<div></div>)
    run(<div>{true}</div>)
    run(<div>{false}</div>)
    run(<div>{null}</div>)
    run(<div>{undefined}</div>)
  })
  // TODO: 测试 自定义组件
})
