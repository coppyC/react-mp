import compare from "./diff";

export default abstract class Updater {

  path: string
  abstract mp: wx.Page
  abstract instances: Instances

  constructor(path: string) {
    this.path = path
  }
  enqueueSetState(
    publicInstance: React.Component,
    partialState: any,
    callback: Function,
    callerName: 'setState'
  ) {
    // TODO: 加个排队
    Object.assign(publicInstance.state, partialState)
    const oldTree = this.instances[this.path].tree
    const newTree = publicInstance.render()
    const data = compare(newTree, oldTree, this.path)
    this.mp.setData(data)
  }
}
