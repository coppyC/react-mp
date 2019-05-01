import U from "../Updater";
import { page, StateComp } from "../data";
import mount from "../lifeCycle/mount";
import * as React from 'react'

test('setState 回调测试', () => {
  const Updater = U.create(page)
  mount(<StateComp />, 'root', Updater)
  const ROOT = Updater.ROOT!
  const owner: StateComp = ROOT.owner as any
  expect.assertions(4)
  owner.componentWillUpdate = function(props, state) {
    expect(state.name).toBe('b')
  }
  expect(Updater.ROOT!.ROOT).toBe(Updater.ROOT)
  return new Promise(resolve => {
    owner.setState({ name: 'b' }, () => {
      expect(ROOT.stateQueue.length).toBe(0)
      resolve()
    })
    expect(ROOT.stateQueue.length).toBe(1)
  })
})

test('setState 异步测试', () => {
  expect.assertions(2)
  let setDataTimes = 0
  return new Promise(resolve => {
    const Updater = U.create({
      setData(data, callback) {
        setDataTimes ++
        callback && callback()
      }
    })
    mount(<StateComp />, 'root', Updater)
    const ROOT = Updater.ROOT!
    const owner: StateComp = ROOT.owner as any
    owner.componentWillUpdate = function(props, state) {
      expect(state.name).toBe('abcde')
    }
    owner.setState(item => ({name:item.name+'b'}))
    owner.setState(item => ({name:item.name+'c'}))
    owner.setState(item => ({name:item.name+'d'}))
    owner.setState(item => ({name:item.name+'e'}), () => {
      expect(setDataTimes).toBe(1)
      resolve()
    })
  })
})

test('卸载测试', () => {
  expect.assertions(2)
  const Updater = U.create(page)
  // 同步测试
  mount(<StateComp />, 'root', Updater)
  Updater.ROOT!.unmount()
  expect(Updater.ROOT).toBe(undefined)
  // 异步测试
  return new Promise(resolve => {
    mount(<StateComp />, 'root', Updater)
    Updater.ROOT!.owner.setState({name:1}, () => {
      setTimeout(() => {
        expect(Updater.ROOT).toBe(undefined)
        resolve()
      }, 1)
    })
    Updater.ROOT!.unmount()
  })
})
