import * as React from 'react'
import mount from "../lifeCycle/mount";
import update from '../lifeCycle/update';
import { Div, page } from '../data';
import U from '../Updater';

class AAA<T={}> extends React.Component<T> {
  state = {x:1}
  render() {
    return (
      <div>{this.state.x}</div>
    )
  }
}

test('最简单的更新', () => {
  const Updater = U.create(page)
  mount(<AAA />, 'root', Updater)
  const data = update(<AAA />, Updater.ROOT!, {x:2})
  expect(Object.keys(data).length).toBe(1)
  expect(data['root.props.children']).toBe('2')
})

test('shouldComponentUpdate 钩子测试', () => {
  const nextState = {x:2}
  class BBB extends AAA<{x:number}> {
    shouldComponentUpdate(preProps: any, preState: any) {
      expect(preProps.x).toBe(1)
      expect(preState).toBe(this.state)
      return false
    }
  }
  const Updater = U.create(page)
  mount(<BBB x={1} />, 'root', Updater)
  const data = update(<BBB x={2} />, Updater.ROOT!, nextState)
  expect(Object.keys(data).length).toBe(0)
})

test('componentWillReceiveProps 钩子测试', () => {
  // 通过父组件更新改变 props 触发
  const nextState = {x:2}
  let hadCallReceiveProps = false
  class DDD extends Div {
    componentWillReceiveProps(nextProps) {
      expect(nextProps.children).toBe(2)
      hadCallReceiveProps = true
    }
  }
  class A extends AAA {
    render() {
      return <DDD>{this.state.x}</DDD>
    }
  }
  const Updater = U.create(page)
  mount(<A />, 'root', Updater)
  const data = update(<A />, Updater.ROOT!, nextState)
  expect(hadCallReceiveProps).toBeTruthy
  expect(Object.keys(data).length).toBe(1)
  expect(Updater.ROOT!.children.length).toBe(0)
  expect(data['root.props.children']).toBe('2')
})

test('componentUpdate 相关钩子测试', () => {
  class A extends React.Component<{name: string}> {
    state = {
      name: '???'
    }
    render() {
      return <div>{this.props.name}{this.state.name}</div>
    }
    componentWillUpdate(nextProps, nextState) {
      expect(nextProps.name).toBe('OvO')
      expect(nextState.name).toBe('!!!')
    }
    componentDidUpdate(prevProps, prevState) {
      expect(prevProps.name).toBe('O_O')
      expect(prevState.name).toBe('???')
    }
  }
  const nextState = {name: '!!!'}
  const Updater = U.create(page)
  mount(<A name="O_O" />, 'root', Updater)
  const data = update(<A name="OvO" />, Updater.ROOT!, nextState)
  expect(Object.keys(data).length).toBe(2)
  expect(data['root.props.children[0]']).toBe('OvO')
  expect(data['root.props.children[1]']).toBe('!!!')
})

test('children 变质测试', () => {
  class A extends React.Component {
    state = {
      type: 0
    }
    render() {
      return this.state.type
        ? <div>123</div>
        : 123
    }
  }
  const nextState = {type: 1}
  const Updater = U.create(page)
  mount(<A />, 'root', Updater)
  const data = update(<A />, Updater.ROOT!, nextState)
  expect(Object.keys(data).length).toBe(1)
  expect(data['root'].type).toBe('div')
})
