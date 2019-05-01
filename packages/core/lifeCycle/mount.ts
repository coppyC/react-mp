import cvt from "../cvt";
import {isValidElement} from 'react'
import Updater from "../Updater";

/** 挂载元素 */
export default function mount(
  node: React.ReactElement,
  path: string,
  TheUpdater: typeof Updater,
  parent?: Updater,
) {
  function renderNode(
    node: React.ReactNode,
    path: string,
    parent?: Updater
  ): React.ReactNode {
    // TODO: 其它类型？ 类似 <></>
    if(!isValidElement(node))
      return cvt.child(node as React.ReactText)
    const element: React.ReactElement = node
    if(typeof element.type === 'string') {
      const { type, key } = element
      const { style, children, ...props } = element.props
      path += '.props.children'
      return {
        type, key,
        props: {
          ...props,
          style: cvt.style(style),
          children: children instanceof Array
            ? children.map((chil,i) => renderNode(chil, `${path}[${i}]`, parent))
            : renderNode(children, path, parent)
        },
      }
    }

    if(typeof element.type === 'function') {
      const proto = element.type.prototype // arrow function 不能 new， 没有 proto
      if(proto && proto.isReactComponent) { // 是个自定义组件
        const constructor: any = element.type
        const comp: React.Component =
          new constructor(element.props, null)
        const theUpdater = new TheUpdater(path, comp, parent)
        if(parent) parent.children.push(theUpdater)
        void ((comp as any).updater = theUpdater)
        theUpdater.currentDOM = comp.render()
        comp.componentWillMount && comp.componentWillMount()
        const node = renderNode(theUpdater.currentDOM, path, theUpdater)
        comp.componentDidMount && comp.componentDidMount()
        return node
      }
      const sfc: React.SFC = element.type as any
      return renderNode(sfc(element.props), path, parent)
    }
  }
  return renderNode(node, path, parent)
}
