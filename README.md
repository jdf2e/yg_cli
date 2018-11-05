# 前端云构建平台

云构平台(简称), 给前端代码工程提供了舒适独立的编译环境，它是一个基础服务, 你可以用它作

  * 本地编码，云上编译
  * 跨端实时调试预览
  * 打开浏览器就可以编码的移动办公

# yg-cli

一个可以把本地工程（Vue、React）交由云构平台进行编译的Cli

## 安装使用
```
    npm install yg-cli -g
```
  * cd 到 工程目录下（Vue、 React工程）,在服务端中安装依赖
```
    yg npm install
```
  * 安装完成后，直接启动（等同于本地 npm run dev 命令）
```
    yg start
```
  * 打开浏览输入 http://yg.jd.com:端口号 即可预览

  * 支持 program api
```
  const yg = require('yg-cli/index')
```  
## 更多操作
    详见 yg -h
    