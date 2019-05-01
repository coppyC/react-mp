import * as React from 'react'
import diff from '../diff';
import unmount from './unmount';
import utils from '../utils';
import mount from './mount';
import Updater from '../Updater';

type ComponentElement = React.ReactElement<any, typeof React.Component>


/**
 * 更新组件: 返回需要更新的数据，可供小程序 setData 直接使用
 * @param element 新的 element
 * @param updater 更新器，当前 element 在更新器中找到
 * @param nextState 新的 state
 */
export default function update(
  element: ComponentElement,
  updater: Updater,
  nextState: any,
): object {
    const {owner} = updater
    const {props: prevProps, state: prevState} = owner
    const {props: nextProps } = element
    const LEGACY_CONTEXT = undefined
    // 没有 shouldComponentUpdate 或 shouldComponentUpdate 表示要更新
    const shouldComponentUpdate =
      !owner.shouldComponentUpdate
      || owner.shouldComponentUpdate!
        (prevProps, prevState, LEGACY_CONTEXT)
    if(shouldComponentUpdate) {
      if(owner.componentWillUpdate)
        owner.componentWillUpdate(nextProps, nextState, LEGACY_CONTEXT)
      owner.state = Object.assign({}, prevState, nextState)
      void ((owner as any).props = nextProps)
      const newDOM = owner.render()
      const oldDOM = updater.currentDOM
      updater.currentDOM = newDOM
      const data = diff(newDOM, oldDOM, updater.path)
      Object.keys(data).sort().forEach(key => {
        const node = data[key]
        if(React.isValidElement(node)) {
          if(updater.isSideEffectComponent() && updater.path === key && utils.isReactComponent(node)) {
            const {owner} = updater.children[0]
            owner.componentWillReceiveProps
              && owner.componentWillReceiveProps(node.props, LEGACY_CONTEXT)
            // safe, valid the node with `isReactComponent` just now
            const diffResult = update(
              node as ComponentElement,
              updater.children[0],
              owner.state,
            )
            delete data[key]
            Object.assign(data, diffResult)
          } else {
            data[key] = mount(node, key, Updater, updater)
          }
        }
        const discardUpdater = updater.children
          .find(updater => updater.path === key)
        discardUpdater && unmount(discardUpdater)
      })
      if(owner.componentDidUpdate)
        owner.componentDidUpdate(prevProps, prevState)
      return data
    }
    return {}
}
