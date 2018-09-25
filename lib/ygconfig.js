/**
 * 解析.ygconfig文件以及相关项目配置，并与默认config合并，得到的config则为项目的配置
 */
const fs = require("fs");
const path = require("path");
const config = require('./config');

let mergedConfig = {};
const ygconfigPath = path.resolve(process.cwd(), '.ygconfig');
try {
  const content = fs.readFileSync(ygconfigPath).toString();
  mergedConfig = !content ? {} : JSON.parse(content);
} catch (error) {
  // verbose 不存在.ygconfig
  mergedConfig = {};
}

mergedConfig = Object.assign({}, config, mergedConfig);

module.exports = mergedConfig;
