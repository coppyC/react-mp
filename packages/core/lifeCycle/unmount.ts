import Updater from "../Updater";

export default function unmount(updater: Updater) {
  updater.children.forEach(unmount)
  const {owner, parent} = updater
  owner.componentWillUnmount
    && owner.componentWillUnmount()
  if(parent) {
    const {children} = parent
    children.splice(children.indexOf(updater), 1)
  } else {
    (updater.constructor as typeof Updater).ROOT = undefined
  }
}
