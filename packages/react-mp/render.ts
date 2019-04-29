import cvt from "./cvt";

function childrenCvt(children, path, ...others) {
  if(!children) return ''
  if(children instanceof Array)
    return children.map((chil,i) => renderNode(chil, `${path}[${i}]`, ...others))
  if(typeof children === 'object')
    return renderNode(children, path, ...others)
  return children
}

function renderNode(
  element: ReactElement,
  path: string,
  instances: Instances,
  Updater: typeof import('./Updater').default
) {
  if(!element) return ''
  if(typeof element !== 'object') return element
  if(typeof element.type === 'string') {
    const { type, key } = element
    const { style, children, ...props } = element.props

    return {
      type, key,
      props: {
        style: cvt.style(style),
        children: childrenCvt(children, `${path}.props.children`, instances, Updater),
        ...props,
      },
    }
  }

  if(typeof element.type === 'function') {
    if(element.type.prototype.isReactComponent) {
      const comp = new element.type(element.props)
      const instance = {
        owner: comp,
        tree: comp.render(),
      }
      comp.updater = new Updater(path)
      comp.componentWillMount && comp.componentWillMount()
      const jsx = renderNode(instance.tree, path, instances, Updater)
      comp.componentDidMount && comp.componentDidMount()
      instances[path] = instance
      return jsx
    }
    return renderNode(element.type(element.props), path, instances, Updater)
  }
}

export default function(
  element: ReactElement,
  path: string,
  instances: Instances,
  Updater: typeof import('./Updater').default
) {
  return renderNode(element, path, instances, Updater)
}
