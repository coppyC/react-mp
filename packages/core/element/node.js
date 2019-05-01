// pages/react/node.js

function createHook(name) {
  return function hook(e) {
    const { props } = this.data
    if(!props) return
    const hook = props[name]
    if(hook instanceof Function)
      hook(e)
  }
}

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    props: null,
    type: null,
  },

  data: {
    /** 记录已挂载事件，原因: wxml 中的函数全为 undefined */
    event: {}
  },

  lifetimes: {
    attached() {
      const proto = Object.getPrototypeOf(this)
      const {event} = this.data
      const props = this.properties.props
      for(let i in props) {
        if(i === 'children') continue
        if(typeof props[i] === 'function')
          event[i] = true
        if(typeof proto[i] !== 'function')
          proto[i] = createHook(i)
      }
      if(Object.keys(event).length > 0)
        this.setData({ event })
    }
  },
})
