// @ts-check
const updater = {
  /**
   * Checks whether or not this composite component is mounted.
   * @param {ReactClass} publicInstance The instance we want to test.
   * @return {boolean} True if mounted, false otherwise.
   * @protected
   * @final
   */
  isMounted: function(publicInstance) {
    return true;
  },

  /**
   * Forces an update. This should only be invoked when it is known with
   * certainty that we are **not** in a DOM transaction.
   *
   * You may want to call this when you know that some deeper aspect of the
   * component's state has changed but `setState` was not called.
   *
   * This will not invoke `shouldComponentUpdate`, but it will invoke
   * `componentWillUpdate` and `componentDidUpdate`.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueForceUpdate: function(publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },

  /**
   * Replaces all of the state. Always use this or `setState` to mutate state.
   * You should treat `this.state` as immutable.
   *
   * There is no guarantee that `this.state` will be immediately updated, so
   * accessing `this.state` after calling this method may return the old value.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} completeState Next state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} callerName name of the calling function in the public API.
   * @internal
   */
  enqueueReplaceState: function(
    publicInstance,
    completeState,
    callback,
    callerName,
  ) {
    warnNoop(publicInstance, 'replaceState');
  },

  /**
   * Sets a subset of the state. This only exists because _pendingState is
   * internal. This provides a merging strategy that is not available to deep
   * properties which is confusing. TODO: Expose pendingState or don't use it
   * during the merge.
   *
   * @param {ReactClass} publicInstance The instance that should rerender.
   * @param {object} partialState Next partial state to be merged with state.
   * @param {?function} callback Called after component is updated.
   * @param {?string} Name of the calling function in the public API.
   * @internal
   */
  enqueueSetState(publicInstance, partialState, callback, callerName) {
    console.log(partialState)
  },
}

// 重写，单元测试
// TODO: children 是组件，props 发生改变
function compareDom(newDom, oldDom, key, cb) {
  if(oldDom===undefined) return cb(key, newDom)
  // 同个类型，继续对比
  if(newDom.type === oldDom.type) {
    const newProps = newDom.props
    const oldProps = oldDom.props
    for(let i in newProps)
      // style 对象转字符对比
      if(i === 'style') {
        const oldStyle = styleString(oldProps[i])
        const newStyle = styleString(newProps[i])
        if(oldStyle !== newStyle)
          cb([key,'props',i].join('.'), newStyle)
      } else if(oldProps[i] !== newProps[i])
        // 是 children 且 新旧 children 都是对象[包括数组]
        if(i==='children' && typeof oldProps[i] === 'object' && typeof newProps[i] === 'object'){
          if(newProps.children instanceof Array) {
            if(oldProps.children instanceof Array)
              for(let i in newProps.children)
                compareDom(newProps.children[i], oldProps.children[i], key+'.props.children'+`[${i}]`, cb)
            else
              cb(key+'.props.children', newProps.children)
          } else {
            compareDom(newProps.children, oldProps.children, key+'.props.children', cb)
          }
        } else {
          // 不是 children 或 children 满足重建条件
          cb([key,'props',i].join('.'), newProps[i])
        }
  } else {
    // 不同类型，直接重建
    cb(key, renderNode(newDom))
  }
}

/**
 * @typedef El
 * @property {string} El.$$typeof
 * @property {any} key
 * @property {any} ref
 * @property {{children:(El[]|El|undefined)}} props
 * @property {typeof React.Component} type
 * @property {React.Component|null} _owner
 */

function styleString(obj) {
  if(!obj) return ''
  if(typeof obj === 'string') return obj
  return Object.keys(obj).map(key => {
    const name = key.replace(/[A-Z]/g, x => '-' + x.toLowerCase())
    let value = obj[key]
    if(typeof value === 'number')
      value = value + 'rpx'
    return name + ':' + value
  }).join(';')
}

function childrenCvt(children, path, ...others) {
  if(!children) return ''
  if(children instanceof Array)
    return children.map((chil,i) => renderNode(chil, `${path}[${i}]`, ...others))
  if(typeof children === 'object')
    return renderNode(children, path, ...others)
  return children
}

/**
 * @param {El} element
 */
function renderNode(element, path, instances, Updater) {
  if(!element) return ''
  if(typeof element !== 'object') return element
  if(typeof element.type === 'string') {
    const { type, key } = element
    const { style, children, ...props } = element.props

    return {
      type, key,
      props: {
        style: styleString(style),
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


const ReactMp = {
  render(jsx) {
    Page({
      data: {
        root: {},
      },
      onLoad(param) {
        const instances = {}
        const mp = this
        class Updater {
          constructor(path) {
            this.path = path
          }
          enqueueSetState(publicInstance, partialState, callback, callerName) {
            // TODO: 加个排队
            Object.assign(publicInstance.state, partialState)
            const oldTree = instances[this.path].tree
            const newTree = publicInstance.render()
            const data = {}
            compareDom(newTree, oldTree, this.path, function(key, value) {
              data[key] = value
            })
            console.log(data)
            mp.setData(data)
          }
        }
        const domTree = renderNode(jsx, 'root', instances, Updater)
        this.setData({root: domTree})
      },
      onReady() {

      },
      onUnload() {

      }
    })
  }
}

export default ReactMp
