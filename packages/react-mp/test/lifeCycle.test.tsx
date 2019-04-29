import * as React from "react";
import render from "../lifeCycle/render";
import Updater from "../Updater";
import diff from "../diff";

class A extends React.Component<{ picture?: any }> {
  render() {
    return <div>{this.props.picture || <Picture></Picture>}</div>
  }
}
class Picture extends React.Component {
  render() {
    return <img src="www.xxx.com/xxxx"/>
  }
}

function createUpdater() {
  return class extends Updater {
    queue = []
  }
}

describe('渲染测试', () => {
  test('自定义组件', () => {
    const domTree: any = render(<Picture />, 'root', {}, createUpdater())
    const diffResult = diff(Picture.prototype.render(), domTree)
    expect(Object.keys(diffResult).length).toBe(0)
  })
  test('嵌套自定义组件', () => {
    // const compChain = []
    const domTree: any = render(<A />, 'root', {}, createUpdater())
    expect(domTree.props.children.type).toBe('img')
    // expect(compChain.length).toBe(2)
    // expect(compChain[0]).toBe('root')
    // expect(compChain[1]).toBe('root.props.children')
  })
  test('props 渲染', () => {
    const domTree: any = render(<A picture="picture" />, 'root', {}, createUpdater())
    expect(domTree.props.children).toBe('picture')
  })
})
