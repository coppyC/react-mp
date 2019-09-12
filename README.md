# 本项目已停止维护
本项目本是我一时兴起，现已无精力维护
目前发现相似项目 https://github.com/remaxjs/remax

# react-mp
[![Build Status](https://www.travis-ci.org/coppyC/react-mp.svg?branch=master)](https://www.travis-ci.org/coppyC/react-mp)
[![coverage](https://codecov.io/gh/coppyC/react-mp/branch/master/graph/badge.svg)](https://codecov.io/gh/coppyC/react-mp)
![version](https://img.shields.io/npm/v/react-mp.svg)
![download](https://img.shields.io/npm/dt/react-mp.svg)
![GitHub](https://img.shields.io/github/license/coppyc/react-mp.svg)

一个跑在微信小程序的 react 框架

# 体验
## 注意！！
⚠️  目前本项目还处于开发中，不可投入使用，但是仍然可以尝鲜
## 安装
[点击下载模版代码](https://github.com/coppyC/react-mp/archive/template.zip),
然后，你懂的
```bash
yarn
yarn dev
```

![2019-05-03 23-03-23 2019-05-03 23_05_20](https://user-images.githubusercontent.com/25004510/57148181-a3923e00-6dfb-11e9-8332-3aa00ca08a3e.gif)


# 框架原理
保留只依赖 js，没有平台问题的 react 核心代码

编写 react-mp 取代 react-dom，来兼容小程序端

利用 小程序自定义组件 可递归的特性，来动态渲染 dom tree

# 目标
无缝连接 react 生态圈

# 与 Taro 的区别
我之前也用过 Taro，Taro 是个很好的框架，它能一份代码编译到不同平台

write once, run anywhere.

这种思想是很厉害，不过实战中，Taro并没有我想的那么舒服，因为它把 jsx 代码编译成小程序的 wxml

这导致了和原生 react 越走越远，很难接入 react 的生态中

不过 Taro 却也让我大吃一惊，他们把 redux，mobx 搞了进来

尽管如此，还是有许多[限制](https://nervjs.github.io/taro/docs/best-practice.html)，手感上不是很好

不过这些限制在本框架中将会不存在

jsx 想在哪里定义，就在哪里定义，它永远是大家熟悉的 `React.createElement`

支持无状态组件! (hook 提案没有测试，而且只是提案，暂不考虑。)

因为本框架不是伪 react

两者虽然都使用了 react 的语法，但实现思路完全是不一样的
