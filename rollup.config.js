// rollup配置
console.log(process.env.TARGET, 'rollup')

import path from 'path'
import json from '@rollup/plugin-json'
// 解析第三方插件
import resolvePlugin from '@rollup/plugin-node-resolve'
// 解析ts
import ts from 'rollup-plugin-typescript2'

// 根据环境变量中的target属性，获取对应模块中的 package.json

const packagesDir = path.resolve(__dirname, 'packages') // D:\zip\vue3\my-vue3\packages

const packageDir = path.resolve(packagesDir, process.env.TARGET) // 找到对应的包路径

// 获取包下面的某个文件路径
const resolve = p => path.resolve(packageDir, p)

// 引入对应包下面的package.json
const pkg = require(resolve('package.json'))
// 获取'/'隔开path的最后一部分， 值等于process.env.TARGET
const name = path.basename(packageDir)

// 对打包类型 先做一个映射表，根据你提供的formats，来格式化需要打包的内容
const outputConfig = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es'
  },
  'cjs': {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs'
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife' // 立即执行函数
  }
}

// 获取package.json中自定义的配置参数
const options = pkg.buildOptions

const createConfig = (format, output) => {
  output.name = options.name
  // 生成sourcemap
  output.sourcemap = true

  // 生成rollup 配置
  return {
    input: resolve('src/index.ts'),
    output,
    // 必须先解析ts，然后解析第三方模块插件
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, 'tsconfig.json')
      }),
      resolvePlugin()
    ]
  }
}

// rollup 最终需要导出配置
export default options.formats.map(format => {
  return createConfig(format, outputConfig[format])
})