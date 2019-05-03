import React, {Component} from 'react'
import './index.css'

class Picture extends Component {
  state = {
    height: 20
  }
  click() {
    this.setState({height:this.state.height+10})
  }
  render() {
    return <img
      onClick={() => this.click()}
      style={{width: '80vw', height: this.state.height}}
      src="https://developers.weixin.qq.com/miniprogram/assets/images/head_global_z_@all.png"
    />
  }
}

export default class extends Component {
  state = {
    text: 'hello world',
    className: ''
  }
  click() {
    this.setState({
      text: 'you click it!!',
      className: 'red',
    })
  }
  render() {
    return (
      <div>
        <div className={this.state.className} onClick={this.click.bind(this)}>{this.state.text}</div>
        <div key="111">???</div>
        <div>okx</div>
        <Picture />
      </div>
    )
  }
  componentWillMount() {
    console.log(this.props)
  }
}
