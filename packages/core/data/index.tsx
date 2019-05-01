import * as React from 'react'

export class Div extends React.Component {
  render() {
    return <div>{this.props.children}</div>
  }
}

export class None extends React.Component {
  render() {
    return this.props.children
  }
}

export class StateComp extends React.Component<{}, {
  name: string
}> {
  state = {
    name: 'a'
  }
  render() {
    return <div>{this.state.name}</div>
  }
}

export const page: Page.PageInstance = {
  setData(data: {}, callback?: () => void) {
    callback && callback()
  }
}
