import glob from 'glob'
import webpack = require('webpack');

/** 获取所有页面入口 */
export default function(): Promise<webpack.Entry> {
  return new Promise((reslove, reject) => {
    glob('src/pages/**/[a-z]*.*(j|t)sx', (err, files) => {
      if(err) return reject(err)
      const entry: webpack.Entry = {}
      files.forEach(file => {
        const name = file.replace(/src\/(.*)\.(j|t)sx/, '$1')
        entry[name] = './' + file
      })
      reslove(entry)
    })
  })
}
