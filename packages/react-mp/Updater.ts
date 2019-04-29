/**
 * Updater 更新器
 */

import diff from "./diff";
import { isValidElement } from "react";

export interface UpdateItem {
  path: string
  publicInstance: React.Component
}

function update(updateQueue: UpdateItem[], instances: Instances) {
  const data = {}
  for(let {path, publicInstance} of updateQueue) {
    const newNode = publicInstance.render()
    const oldNode = instances[path].tree
    if(isValidElement(newNode) && isValidElement(oldNode)) {
      const resutl = diff(newNode, oldNode, path)
      Object.assign(data, resutl)
    } else if(isValidElement(newNode)) {
      // TODO: mount
      // data[this.path] =
    } else if(isValidElement(oldNode)) {
      // TODO: unmount
    } else {
      data[path] = oldNode
    }
  }
  return data
}

function clear(updateQueue: UpdateItem[]) {
  updateQueue.splice(0, updateQueue.length)
}

export default abstract class Updater {
  static update = update
  static clear = clear

  path: string
  abstract queue: UpdateItem[]

  constructor(path: string) {
    this.path = path
  }
  enqueueSetState(
    publicInstance: React.Component,
    partialState: any,
    callback?: Function,
    // callerName: 'setState'
  ) {
    // TODO: 加个排队
    if(typeof partialState === 'function') {
      partialState = partialState(publicInstance.state)
    }
    Object.assign(publicInstance.state, partialState)
    callback && callback()
    const index = this.queue.findIndex(item => item.path === this.path)
    if(index > -1) {
      this.queue.splice(index, 1)
    }
    this.queue.push({ path: this.path, publicInstance })
  }
}
