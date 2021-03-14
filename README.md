### 从零手写vue3源码

> 从零开始手写实现vue3的部分源码

##### package.json配置项
+ private 私有属性
+ workspaces 包的存放空间
+ name 模块名   @vue/xxx 表示vue包下的xxx模块，在引入模块时可以 import '@vue/xxx'
+ main 给commonjs使用，引入时默认引入main配置的文件
+ module 给webpack使用,import时采用
+ buildOptions 自定义的打包配置字段  name -- 方法名   formats -- 支持的打包模块  'cjs': commonjs模块  'esm-bundler': es6模块  'global': 全局模块
+ scripts 打包脚本

##### 需要用到的模块插件
+ typescript
+ rollup
+ rollup-plugin-typescript2
+ @rollup/plugin-node-resolve
+ @rollup/plugin-json
+ execa
> 安装时要在语句最后加上 --ignore-workspace-root-check，忽略工作空间，把模块安装在根目录下

##### rollup
+ rollup.config.js 执行rollup打包时，默认会执行根目录下的rollup.config.js
+ 使用execa, 开启子进程，进行打包，最终使用rollup进行打包

##### ts
+ npx tsc --init 生成typescript配置文件，当安装了typescript时，执行该指令有效，执行的文件时node_modules->bin目录下->tsc
+ module 模块类型
> 'commonjs', 'amd', 'system', 'umd', 'es2015', 'es2020', or 'ESNext'. ESNext表示比es更高的版本
+ sourcemap
> 是否打开映射，方便打包代码调试, rollup.config.js里output.sourcemap = true也要设置才行

##### yarn install
> 会依据package.json workspaces: "packages/*",把packages下的文件添加到node_modules下的软链，文件夹名为模块下package.json下的name，在模块文件里可以直接引用node_modules下的模块
> 引用node_modules下的软链需要配置tsconfig.json,否则会报错.
> 配置方式："moduleResolution": "node", "baseUrl": ".", "paths": { "@vue/*": ["packages/*/src"] }

##### yarn workspace @vue/reactivity add @vue/shared@1.0.0 
> 把reactivity增加到shared下package.json的安装依赖里
