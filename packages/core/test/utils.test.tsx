import * as React from 'react'
import utils from "../utils";

describe('React 节点判断', () => {
  test('自定义组件判断', () => {
    const element = <div>123</div>
    const SFC0 = () => <div>123</div>
    function SFC1() {return <div>123</div>}
    class Comp extends React.Component {}
    expect(utils.isReactComponent(0)).toBeFalsy
    expect(utils.isReactComponent(element)).toBeFalsy
    expect(utils.isReactComponent(<SFC0 />)).toBeFalsy
    expect(utils.isReactComponent(<SFC1 />)).toBeFalsy
    expect(utils.isReactComponent(<Comp />)).toBeFalsy
  })
})
