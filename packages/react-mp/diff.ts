import cvt from "./cvt";
import { goto } from "./utils";
import * as React from "react";

const {isValidElement} = React

function diffElement(
  newEl: React.ReactElement,
  oldEl: React.ReactElement,
  key: string,
  callback: (key: string, value: any, oldValue: any) => void,
) {
  function cd(dir: string) {
    key = goto(key, dir)
  }
  if(newEl.type !== oldEl.type) {
    // 不同类型，直接重构
    callback(key, newEl, oldEl)
  } else {
    // 同个类型，属性可能改变，进一步对比 props 中的内容
    cd('props') // .props
    const { children: newChild, ...newProps} = newEl.props
    const { children: oldChild, ...oldProps} = oldEl.props
    for(let name in newProps) {
      if(name === 'style') {
        // style 需要特殊处理
        const oldStyle = cvt.style(oldProps[name])
        const newStyle = cvt.style(newProps[name])
        if(oldStyle !== newStyle)
          callback(`${key}.${name}`, newStyle, undefined)
      } else {
        if(newProps[name] !== oldProps[name]) {
          callback(`${key}.${name}`, newProps[name], undefined)
        }
      }
    }
    cd('children')  // .props.children
    if(newChild !== oldChild) {
      if(typeof newChild ==='object' && typeof oldChild ==='object') { // 两者是 元素或 元素组
        if(newChild instanceof Array && oldChild instanceof Array) { // 是数组
          if(newChild.length !== oldChild.length) {
            callback(key, newChild, oldChild)
          } else {
            for(let i in newChild) {
              if(newChild[i] !== oldChild[i]) {
                if(React.isValidElement(newChild[i]) && React.isValidElement(oldChild[i]))
                  diffElement(newChild[i], oldChild[i], `${key}[${i}]`, callback)
                else
                  callback(`${key}[${i}]`, newChild[i], oldChild[i])
              }
            }
          }
        } else if(!(newChild instanceof Array) && !(oldChild instanceof Array)) {  // 都元素
          diffElement(newChild, oldChild, `${key}`, callback)
        } else {  // 一个数组一个元素等。。
          callback(key, newChild, oldChild)
        }
      } else {
        if(!isValidElement(newChild) && !isValidElement(oldChild)) {
          // 忽略 布尔值、null 和 undefined
          if(cvt.child(newChild) !== cvt.child(oldChild))
            callback(key, newChild, oldChild)
        } else {
          callback(key, newChild, oldChild)
        }
      }
    }
  }
}

export default function(
  newDom: React.ReactElement,
  oldDom: React.ReactElement,
  path = ''
): any {
  const result = Object.create(null)
  diffElement(newDom, oldDom, path, function(key, value, oldValue) {
    if(oldValue instanceof Array || isValidElement(oldValue)) {
      // TODO: @生命周期 unmount Element
    }
    result[key] = value instanceof Array || isValidElement(value)
      ? value // TODO: 新元素 mount 等
      : cvt.child(value)
  })
  return result
}
