import React, {Component} from 'react'
import './index.css'

class Picture extends Component {
  state = {
    height: 20
  }
  render() {
    return <img
      onClick={() => {this.setState({height:80})}}
      style={{width: '80vw', height: this.state.height}}
      src="https://developers.weixin.qq.com/miniprogram/assets/images/head_global_z_@all.png"
    />
  }
}

export default class extends Component {
  state = {
    text: 'hello world',
    style: {}
  }
  click() {
    this.setState({
      text: 'you click it!!',
      style: {
        color: 'red'
      }
    })
  }
  render() {
    return (
      <div>
        <div style={this.state.style} onClick={this.click.bind(this)}>{this.state.text}</div>
        <div key="111">???</div>
        <div>okx</div>
        <Picture />
      </div>
    )
  }
  componentWillMount() {
    console.log(1)
  }
}
