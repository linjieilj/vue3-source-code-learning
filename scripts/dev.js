// 只针对具体的某个包进行打包

// 先读取packages目录下的所有模块
const fs = require('fs')
// 开启子进程，进行打包，最终使用rollup进行打包
const execa = require('execa')

const target = 'reactivity'

// 对目标依次进行打包，并行打包
async function build(target) {
  // 第一个参数是执行的命令，执行rollup打包， 第二个参数是执行的参数 -cw --environment TARGET:shared w表示一直监控文件的变化  第三个参数 {stdio: 'inherit'} 表示当子进程打包的信息共享给父进程
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {stdio: 'inherit'})
}

build(target)