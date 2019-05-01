import * as React from "react";
import mount from "../lifeCycle/mount";
import U from "../Updater";
import { None, page } from "../data";

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

describe('渲染测试', () => {
  test('自定义组件 Updater 挂载测试', () => {
    const Updater = U.create(page)
    const domTree: any = mount(<Picture />, 'root', Updater)
    const ROOT = Updater.ROOT!
    expect(domTree.type).toBe('img')
    expect(ROOT.path).toBe('root')
    expect(ROOT.parent).toBeUndefined
    expect(ROOT.owner).toBeInstanceOf(React.Component)
    expect(ROOT.children).toBeInstanceOf(Array)
    expect(ROOT.children.length).toBe(0)
  })
  test('嵌套自定义组件', () => {
    const Updater = U.create(page)
    const domTree: any = mount(<A />, 'root', Updater)
    const ROOT = Updater.ROOT!
    expect(domTree.props.children.type).toBe('img')
    expect(ROOT.path).toBe('root')
    expect(ROOT.children.length).toBe(1)
    expect(ROOT.children[0]).toBeInstanceOf(Updater)
    expect(ROOT.children[0].path).toBe('root.props.children')
    expect(ROOT.children[0].parent).toBe(ROOT)
  })
  test('数组children', () => {
    const jsx = (
      <div>
        <div>123</div>
        <div>123</div>
      </div>
    )
    const domTree: any = mount(jsx, 'root', U.create(page))
    expect(U.ROOT).toBeUndefined
    expect(domTree.props.children.length).toBe(2)
  })
  test('SFC 组件测试', () => {
    const Updater = U.create(page)
    const AAA: React.SFC = (props) => (
      <div style={{color:'red'}}>{props.children}</div>
    )
    const domTree: any = mount(<AAA>123</AAA>, 'root', Updater)
    expect(Updater.ROOT).toBeUndefined
    expect(domTree.props.style).toBe('color:red')
    expect(domTree.props.children).toBe('123')
  })
  test('props 渲染', () => {
    const Updater = U.create(page)
    const domTree: any = mount(<A picture="picture" />, 'root', Updater)
    expect(domTree.props.children).toBe('picture')
    expect((Updater.ROOT!.owner.props as any).picture).toBe('picture')
  })
  test('生命周期 mount 顺序测试', () => {
    // https://react.docschina.org/docs/state-and-lifecycle.html
    const lifeChain: string[] = []
    const A_CONSTRUCTOR = 'a constructor'
    const A_WILL_MOUNT = 'a will mount'
    const A_DID_MOUNT = 'a did mount'
    const B_CONSTRUCTOR = 'b constructor'
    const B_WILL_MOUNT = 'b will mount'
    const B_DID_MOUNT = 'b did mount'
    class A extends React.Component {
      render() {
        return <B />
      }
      constructor(props) {
        super(props)
        lifeChain.push(A_CONSTRUCTOR)
      }
      componentWillMount() {
        lifeChain.push(A_WILL_MOUNT)
      }
      componentDidMount() {
        lifeChain.push(A_DID_MOUNT)
      }
    }
    class B extends React.Component {
      render() {
        return <div>123</div>
      }
      constructor(props: any) {
        super(props)
        lifeChain.push(B_CONSTRUCTOR)
      }
      componentWillMount() {
        lifeChain.push(B_WILL_MOUNT)
      }
      componentDidMount() {
        lifeChain.push(B_DID_MOUNT)
      }
    }
    mount(<A />, 'root', U.create(page))
    const EXPECT_CHAIN = [
      A_CONSTRUCTOR, A_WILL_MOUNT, B_CONSTRUCTOR, B_WILL_MOUNT, B_DID_MOUNT, A_DID_MOUNT
    ]
    expect(lifeChain.length).toBe(EXPECT_CHAIN.length)
    lifeChain.forEach((life, index) => {
      expect(life).toBe(EXPECT_CHAIN[index])
    })
  })
  test('side effect 组件测试', () => {
    const Updater = U.create(page)
    const comp = <None><None>2333</None></None>
    const tree: any = mount(comp, 'root', Updater)
    expect(tree).toBe('2333')
    expect(Updater.ROOT!.path).toBe('root')
    expect(Updater.ROOT!.owner).toBeInstanceOf(None)
    expect(Updater.ROOT!.children[0].path).toBe('root')
    expect(Updater.ROOT!.children[0].owner).toBeInstanceOf(None)
  })
})
