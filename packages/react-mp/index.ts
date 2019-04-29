import * as React from 'react'
import render from './lifeCycle/render';
import Updater, { UpdateItem } from './Updater';


export default {
  render(Compoment: typeof React.Component, id = 'root') {
    /** 存活组件 */
    let ins!: Instances
    /** 异步更新队列 */
    let queue!: UpdateItem[]
    /** 异步更新 id */
    let updateId
    function init() {
      ins = {}
      queue = []
      updateId = undefined
    }
    class TheUpdater extends Updater {
      queue = queue
    }
    Page({
      onLoad(query: any) {
        init()
        const root = render(
          React.createElement(Compoment, query),
          id, ins, TheUpdater
        )
        this.setData!({ [id]: root })
        updateId = setInterval(() => {
          if(queue.length > 0) {
            const data = Updater.update(queue, ins)
            this.setData!(data)
          }
        }, 1)
      },
      onUnload() {
        clearInterval(updateId)
      }
    })
  }
}
