/**
 * 解析.ygconfig文件以及相关项目配置，并与默认config合并，得到的config则为项目的配置
 */
const fs = require("fs");
const path = require("path");
const config = require('./config');
const saveYgConfig = require('./saveYgConfig');
const util = require('./util')

let mergedConfig
module.exports = function (argv) {
  if ( !mergedConfig ) {
    util.setDirname(argv)
    // 任何读取config的都将初始化.ygconfig
    saveYgConfig(argv);

    const ygconfigPath = path.resolve(argv.dirname, '.ygconfig');
    try {
      const content = fs.readFileSync(ygconfigPath).toString();
      mergedConfig = !content ? {} : JSON.parse(content);
    } catch (error) {
      // verbose 不存在.ygconfig
      mergedConfig = {};
    }

    mergedConfig = Object.assign({}, config, {ygconfig: mergedConfig});
  }
  
  return mergedConfig
}
