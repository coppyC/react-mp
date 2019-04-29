import Updater, { UpdateItem } from "../Updater";
import * as React from 'react'
import cvt from "../cvt";

class TestComponent extends React.Component {
  state = { x: 0 }
  render() {
    return (
      <div>{this.state.x}</div>
    )
  }
}

describe('update 流程测试', () => {
  const updateQueue: UpdateItem[] = []
  class PageUpdater extends Updater {
    queue = updateQueue
  }
  const pageUpdater = new PageUpdater('root')
  const element = new TestComponent({})
  const instances: Instances = {
    'root': {
      tree: element.render(),
      owner: element,
    }
  }
  pageUpdater.enqueueSetState(element, {x:1})
  test('Updater 待更新队列', () => {
    expect(pageUpdater.queue.length).toBe(1)
    const [{path, publicInstance}] = pageUpdater.queue
    expect(path).toBe('root')
    expect(publicInstance).toBe(element)
  })
  test('同个组件同一时间多次加入队列，结果应为一次加入', () => {
    pageUpdater.enqueueSetState(element, {x:2})
    pageUpdater.enqueueSetState(element, {x:3})
    expect(pageUpdater.queue.length).toBe(1)
    const [{path, publicInstance}] = pageUpdater.queue
    expect(path).toBe('root')
    expect(publicInstance).toBe(element)
  })
  test('执行 update 动作', () => {
    const data = Updater.update(updateQueue, instances)
    expect(data['root.props.children'])
      .toBe(cvt.child(element.state.x))
  })
  test('Updater 清空队列，队列长度为空，同时指针不变', () => {
    Updater.clear(updateQueue)
    expect(updateQueue.length).toBe(0)
    expect(updateQueue).toBe(pageUpdater.queue)
  })
})
