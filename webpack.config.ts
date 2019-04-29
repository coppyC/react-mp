import path from 'path'
import webpack, { compilation } from 'webpack'
import CopyPlugin from 'copy-webpack-plugin'

import {ConcatSource} from 'webpack-sources'

const WXML_TEMPLATE = '<react type="{{root.type}}" props="{{root.props}}" />'
const appjson = {
  pages: [] as any[],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "WeChat",
    navigationBarTextStyle: "black"
  }
}

function addFileToChunk(
  compilation: compilation.Compilation,
  chunk: compilation.Chunk,
  filename: string,
  fileSrouce: string,
) {
  const concatSource = new ConcatSource()
  concatSource.source = () => fileSrouce
  compilation.assets[filename] = concatSource
  chunk.files.push(filename)
}

class ReactMpPlugin {
  apply(compiler: webpack.Compiler) {
    const NAME = 'MyExampleWebpackPlugin'
    // Specify the event hook to attach to
    compiler.hooks.emit.tap(NAME, (compilation) => {
      const app = new ConcatSource()
      appjson.pages = []
      app.source = () => JSON.stringify(appjson, null, 2)
      compilation.assets['app.json'] = app

      const processedChunk = new Set()
      // const jsonpFunction = compilation.outputOptions.jsonpFunction

      function toPosix(path) {
        return path.replace(/\\/g, '/')
      }

      function getTargetFile (file) {
        let targetFile = file
        const queryStringIdx = targetFile.indexOf('?')
        if (queryStringIdx >= 0) {
          targetFile = targetFile.substr(0, queryStringIdx)
        }
        return targetFile
      }

      function processChunk (chunk, relativeChunks) {
        if (!chunk.files[0] || processedChunk.has(chunk)) {
          return
        }

        let originalSource = compilation.assets[chunk.files[0]]
        const source = new ConcatSource()
        source.add('var window = window || global;   ')

        relativeChunks.forEach((relativeChunk) => {
          if (!relativeChunk.files[0]) return
          let chunkPath = getTargetFile(chunk.files[0])
          let relativePath = getTargetFile(relativeChunk.files[0])
          relativePath = path.relative(path.dirname(chunkPath), relativePath)
          if (!/^\./.test(relativePath)) {
            relativePath = `.${path.sep}${relativePath}`
          }
          relativePath = toPosix(relativePath)
          source.add(`require("${relativePath}");\n`)
        })

        source.add(originalSource)

        compilation.assets[chunk.files[0]] = source
        processedChunk.add(chunk)
      }

      compilation.chunkGroups.forEach(chunkGroup => {
        // TODO: config
        chunkGroup.origins.request // 入口地址

        let runtimeChunk, entryChunk
        const middleChunks: any[] = []
        let chunksLength = chunkGroup.chunks.length
        chunkGroup.chunks.forEach((chunk: compilation.Chunk, index: number) => {
          if (index === 0) {
            runtimeChunk = chunk
          } else if (index === chunksLength - 1) {
            entryChunk = chunk
          } else {
            middleChunks.push(chunk)
          }
        })
        if (runtimeChunk) {
          processChunk(runtimeChunk, [])
          if (middleChunks.length) {
            middleChunks.forEach((middleChunk) => {
              processChunk(middleChunk, [runtimeChunk])
            })
          }
          if (entryChunk) {
            middleChunks.unshift(runtimeChunk)
            processChunk(entryChunk, middleChunks)
          }
        }
      })

      compilation.chunks.forEach((chunk: compilation.Chunk) => {
        if(/pages(.*)\/[a-z][^/]*/.test(chunk.name)) {
          if(/(\/index)+$/.test(chunk.name))
            appjson.pages.unshift(chunk.name)
          else
            appjson.pages.push(chunk.name)
          const pagejson = {
            usingComponents: {
              react: "/react/react"
            }
          }
          addFileToChunk(compilation, chunk, chunk.name + '.wxml', WXML_TEMPLATE)
          addFileToChunk(compilation, chunk, chunk.name + '.json', JSON.stringify(pagejson, null, 2))
        }
      })

    })
  }
}

const config: webpack.Configuration = {
  entry: require('./getPages'),
  mode: 'none',
  devtool: 'source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      { test: /(?!\.test)\.tsx?$/, exclude: /test/, loader: "ts-loader" },
      { test: /\/pages\/.*\.tsx$/, loaders: ["ts-loader", path.resolve('loader.js')] },
      { test: /\.jsx$/, loader: 'babel-loader' },
      {
        test: /\/pages\/.*\.jsx$/,
        use: [
          'babel-loader',
          path.resolve('loader.js'),
        ]
      },
      {
        test: /\.css$/,
        use: [
          'file-loader?' + 'name=pages/[name].wxss',
          'extract-loader',
          'css-loader'
        ],
      },

    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    }
  },
  plugins: [
    new ReactMpPlugin(),
    new CopyPlugin([
      { from: 'react', to: 'react' },
    ])
  ],

  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'utils/common',

          minChunks: 1,
          chunks: 'initial',
          priority: 0,
        },
        npm: {
          name: 'utils/npm',
          minSize: 1,
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: 10,
        }
      }
    }
  }
}

export default config
