import { isValidElement } from "react";

export default {
  isReactComponent(node: React.ReactNode) {
    if(!isValidElement(node)) return false
    const type = node.type
    if(typeof type !== 'function') return false
    const proto = type.prototype
    if(!proto) return false
    if(!proto.isReactComponent) return false
    return true
  }
}
