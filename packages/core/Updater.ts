import unmount from "./lifeCycle/unmount";
import update from "./lifeCycle/update";
import * as React from 'react'

/**
 * Updater 更新器
 */

type PartialState = object | ((preState: object) => object)
type Component = React.Component

// 是个抽象类，不能直接使用
export default class Updater {
  static ROOT?: Updater    // 会在挂载时自动设置

  static create(page: Page.PageInstance) {
    return class TheUpdater extends Updater {
      setData = page.setData!.bind(page)
    }
  }

  currentDOM: React.ReactNode
  path: string
  owner: Component
  parent?: Updater
  children: Updater[] = []
  stateQueue: PartialState[] = []
  task?: Promise<void>
  setData!: (data: {}, callback?: () => void) => void

  constructor(path: string, owner: Component, parent?: Updater) {
    this.path = path
    this.owner = owner
    if(parent)
      this.parent = parent
    else
      (this.constructor as typeof Updater).ROOT = this
  }
  enqueueSetState(
    inst: React.Component,
    partialState: PartialState,
    callback?: () => void,
  ) {
    this.stateQueue.push(partialState)  // 加入队列
    if(!this.task) {
      // 设置队列执行任务
      this.task = new Promise(resolve => {
        setTimeout(() => {
          const nextState = this.stateQueue.reduce((prevState, partialState) => {
            if(typeof partialState === 'function')
              partialState = partialState(prevState)
            return Object.assign(prevState, partialState)
          }, Object.assign({}, inst.state))
          this.task = undefined            // state 提取完毕，删除任务
          this.stateQueue = []             // 清空队列
          this.update(nextState, resolve)  // 执行更新操作
        }, 1)
      })
    }
    callback && this.task.then(callback)
  }

  /** owner 是不是 SideEffectComponent 组件: render 结果为 其它自定义组件 */
  isSideEffectComponent() {
    return this.children.length === 1
      && this.path === this.children[0].path
  }
  get ROOT() {
    return (this.constructor as typeof Updater).ROOT!
  }
  update(nextState: {}, callback: () => void) {
    const {owner} = this
    const ThisComponent: any = owner.constructor
    const data = update(
      React.createElement(ThisComponent, owner.props) as any,
      this, nextState
    )
    this.setData(data, callback)
  }
  unmount() {
    const run = () => unmount(this)
    if(!this.task) run()
    else this.task.then(run)
  }
}
