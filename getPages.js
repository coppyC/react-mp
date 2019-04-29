const glob = require('glob')

/** 获取所有页面入口 */
module.exports = function() {
  return new Promise((reslove, reject) => {
    glob('src/pages/**/[a-z]*.*(j|t)sx', (err, files) => {
      if(err) return reject(err)
      const entry = {}
      files.forEach(file => {
        const name = file.replace(/src\/(.*)\.(j|t)sx/, '$1')
        entry[name] = './' + file
      })
      reslove(entry)
    })
  })
}
