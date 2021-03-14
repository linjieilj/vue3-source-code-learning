// 把package 目录下的所有包进行打包

// 先读取packages目录下的所有模块
const fs = require('fs')
// 开启子进程，进行打包，最终使用rollup进行打包
const execa = require('execa')

const packages = fs.readdirSync('packages').filter(f => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) return false
  return true
})

// 对目标依次进行打包，并行打包
async function build(target) {
  // 第一个参数是执行的命令，执行rollup打包， 第二个参数是执行的参数 -c --environment TARGET:shared  第三个参数 {stdio: 'inherit'} 表示当子进程打包的信息共享给父进程
  await execa('rollup', ['-c', '--environment', `TARGET:${target}`], {stdio: 'inherit'})
}

function runParallel(packages, iteratorFn) {
  const res = []
  for (const item of packages) {
    const result = iteratorFn(item)
    res.push(result)
  }
  return Promise.all(res)
}

runParallel(packages, build)