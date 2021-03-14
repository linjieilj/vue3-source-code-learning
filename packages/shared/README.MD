### vue 共享模块

##### package.json配置项
+ private 私有属性
+ workspaces 包的存放空间
+ name 模块名   @vue/xxx 表示vue包下的xxx模块，在引入模块时可以 import '@vue/xxx'
+ main 给commonjs使用，引入时默认引入main配置的文件
+ module 给webpack使用,import时采用
+ buildOptions 自定义的打包配置字段  name -- 方法名   formats -- 支持的打包模块  'cjs': commonjs模块  'esm-bundler': es6模块  'global': 全局模块