import * as React from 'react'
import mount from "../lifeCycle/mount";
import unmount from '../lifeCycle/unmount';
import U from '../Updater';
import { page } from '../data';

const A_WILL_UNMOUNT = 'A will unmount'
const B_WILL_UNMOUNT = 'B will unmount'

const lifeChain: string[] = []

class A extends React.Component {
  render() {
    return <div><B /></div>
  }
  componentWillUnmount() {
    lifeChain.push(A_WILL_UNMOUNT)
  }
}
class B extends React.Component {
  render() {
    return <img src="www.xxx.com/xxxx"/>
  }
  componentWillUnmount() {
    lifeChain.push(B_WILL_UNMOUNT)
  }
}

test('从根目录卸载', () => {
  const Updater = U.create(page)
  mount(<A />, 'root', Updater)
  unmount(Updater.ROOT!)
  expect(Updater.ROOT).toBeUndefined
  expect(lifeChain.length).toBe(2)
  expect(lifeChain[0]).toBe(B_WILL_UNMOUNT)
  expect(lifeChain[1]).toBe(A_WILL_UNMOUNT)
})
