/**
 * diff 差分算法
 */

import cvt from "./cvt";
import * as React from "react";
import utils from "./utils";

const isElement = React.isValidElement

function mergeKeys(arr1: string[], arr2: string[]) {
  let arr = new Set(arr1.concat(arr2))
  return [...arr]
}

// 浅比较，当需要进行深比较时，会放弃，并返回 true
export function isEqualProps(propsA: any, propsB: any) {
  const keysA = Object.keys(propsA)
  const keysB = Object.keys(propsB)
  const keys = mergeKeys(keysA, keysB)
  if(keys.length!==keysA.length || keys.length!==keysB.length)
    return false
  if(isElement(propsA.children) || isElement(propsB.children))
    return false // 成本过高，放弃比较
  if(cvt.child(propsA.children) !== cvt.child(propsB.children))
    return false
  return keys.every(key => {
    if(key === 'style' && cvt.style(propsA.style) !== cvt.style(propsB.style))
      return false
    else if(propsA[key] !== propsB[key])
      return false
    return true
  })
}

function diffElement(
  newEl: React.ReactElement,
  oldEl: React.ReactElement,
  key: string,
  callback: (key: string, value: any) => void,
) {
  if(newEl.type !== oldEl.type) // 不同类型，直接重构
    return callback(key, newEl)
  if(utils.isReactComponent(newEl)) { // 同一类型，两者都是自定义组件
    if(!isEqualProps(newEl.props, oldEl.props))
      return callback(key, newEl)
  }
  // 同个类型，属性可能改变，进一步对比 props 中的内容
  key += '.props' // .props
  const { children: newChild, ...newProps} = newEl.props
  const { children: oldChild, ...oldProps} = oldEl.props
  const keys = mergeKeys(
    Object.keys(newProps),
    Object.keys(oldProps),
  )
  for(let propname of keys) {
    if(propname === 'style') {
      // style 需要特殊处理
      const oldStyle = cvt.style(oldProps[propname])
      const newStyle = cvt.style(newProps[propname])
      if(oldStyle !== newStyle)
        callback(`${key}.${propname}`, newStyle)
      continue
    }
    if(newProps[propname] !== oldProps[propname])
      callback(`${key}.${propname}`, newProps[propname])
  }
  key += '.children'  // .props.children
  if(newChild !== oldChild) {
    if(typeof newChild ==='object' && typeof oldChild ==='object') { // 两者是 元素或 元素组
      if(newChild instanceof Array && oldChild instanceof Array) { // 是数组
        if(newChild.length !== oldChild.length) {
          callback(key, newChild)
        } else {
          for(let i in newChild) {
            if(newChild[i] !== oldChild[i]) {
              if(isElement(newChild[i]) && isElement(oldChild[i]))
                diffElement(newChild[i], oldChild[i], `${key}[${i}]`, callback)
              else
                callback(`${key}[${i}]`, newChild[i])
            }
          }
        }
      } else if(!(newChild instanceof Array) && !(oldChild instanceof Array)) {  // 都元素
        diffElement(newChild, oldChild, `${key}`, callback)
      } else {  // 一个数组一个元素等。。
        callback(key, newChild)
      }
    } else {
      if(!isElement(newChild) && !isElement(oldChild)) {
        // 忽略 布尔值、null 和 undefined
        if(cvt.child(newChild) !== cvt.child(oldChild))
          callback(key, newChild)
      } else {
        callback(key, newChild)
      }
    }
  }
}

export default function(
  newNode: React.ReactNode,
  oldNode: React.ReactNode,
  path: string,
) {
  const result: any = Object.create(null)
  if(isElement(newNode) && isElement(oldNode)) {
    diffElement(newNode, oldNode, path, function(key, value) {
      // 只得出差分浅结果，不对结果中的自定义组件进行渲染，废弃组件进行销毁，
      // 需要在外部(update)根据 result 中的 key，在 instances 查表，然后进行 mount，umount 等。
      result[key] = value instanceof Array || isElement(value)
        ? value
        : cvt.child(value)

    })
  } else {
    if(newNode !== oldNode)
      result[path] = isElement(newNode) || isElement(oldNode)
        ? newNode
        : cvt.child(<any>newNode)
  }
  return result
}
