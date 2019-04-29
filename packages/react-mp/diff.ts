import cvt from "./cvt";
import { goto } from "./utils";
import * as React from "react";
// import render from './render'


function diffElement(
  newEl: React.ReactElement,
  oldEl: React.ReactElement,
  key: string,
  callback: (key: string, value: any) => void,
) {
  function cd(dir: string) {
    key = goto(key, dir)
  }
  if(newEl.type !== oldEl.type) {
    // 不同类型，直接重构
    callback(key, newEl)
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
          callback(`${key}.${name}`, newStyle)
      } else {
        if(newProps[name] !== oldProps[name]) {
          callback(`${key}.${name}`, newProps[name])
        }
      }
    }
    cd('children')  // .props.children
    if(newChild !== oldChild) {
      if(typeof newChild ==='object' && typeof oldChild ==='object') { // 两者是 元素或 元素组
        if(newChild instanceof Array && oldChild instanceof Array) { // 是数组
          if(newChild.length !== oldChild.length) {
            callback(key, newChild)
          } else {
            for(let i in newChild) {
              if(newChild[i] !== oldChild[i]) {
                if(React.isValidElement(newChild[i]) && React.isValidElement(oldChild[i]))
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
        callback(key, newChild)
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
  diffElement(newDom, oldDom, path, function(key, value) {
    // TODO: value 如果 是刚刚新建的，要 cvt 一下，在这里做还是在外面做？
    // 或者是 把 newDom 和 oldDom 在外面弄好了再带进来？
    result[key] = value
  })
  return result
}
