import cvt from "../cvt";
import {isValidElement} from 'react'

export default function render(
  node: React.ReactNode,
  path: string,
  instances: Instances,
  Updater: typeof import('../Updater').default,
) {
  function renderNode(node: React.ReactNode, path: string): React.ReactNode {
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
            ? children.map((chil,i) => renderNode(chil, `${path}[${i}]`))
            : renderNode(children, path)
        },
      }
    }

    if(typeof element.type === 'function') {
      if(element.type.prototype.isReactComponent) {
        const constructor: any = element.type
        const comp: React.Component =
          new constructor(element.props, null, new (Updater as any)(path))
        const instance = {
          owner: comp,
          tree: comp.render(),
        }
        comp.componentWillMount && comp.componentWillMount()
        instances[path] = instance
        comp.componentDidMount && comp.componentDidMount()
        return renderNode(instance.tree, path)
      }
      const sfc: React.SFC = element.type as any
      return renderNode(sfc(element.props), path)
    }
  }
  return renderNode(node, path)
}
