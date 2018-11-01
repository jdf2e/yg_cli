const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const util = require('./util');

/**
 * init流程
 * 1、读取package.json，判断是否存在pkg.yg.parser
 * 2、如果存在，弹出确认框确认，同意覆盖则继续判断服务端是否存在目标编译器名
 * 3、如果存在，直接更新pkg.yg.parser，结束。
 * 除了build、start、npm三条命令需要将本地数据上传到服务端，其他命令均不需要
 * @param {*} socket socket
 * @param {*} argv 命令行参数
 */
async function init(socket, argv) {
  const parserName = argv.parserName;
  const ygconfigFile = path.resolve(argv.dirname, '.ygconfig');
  const pkgFile = path.resolve(argv.dirname, 'package.json');
  let projconfig = {};
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgFile).toString());
    projconfig = JSON.parse(fs.readFileSync(ygconfigFile).toString());
  } catch (error) {
    projconfig = {};
  }

  if (!pkg) {
    console.log('请先执行npm init初始化package.json');
    socket.disconnect();
    return;
  }

  let pass = true;
  if (pkg.yg && pkg.yg.parser) {
    if (pkg.yg.parser === parserName) {
      console.log('正在使用该编译器');
      socket.disconnect();
      return;
    }
    await inquirer.prompt([{
      type: 'confirm',
      name: 'pass',
      message: `已存在编译器${pkg.yg.parser}, 确认覆盖?`
    }])
    .then(answers => {
      pass = answers.pass;
    });
  }

  if (!pass) {
    console.log('不同意覆盖，退出咯');
    socket.disconnect();
    return;
  }

  socket.on(eventconsts.cli.check, protocol => {
    socket.disconnect();

    if (!protocol.args.isExsit) {
      console.log('不存在该编译器名，请check可用编译器');
      return;
    }

    pkg.yg = pkg.yg || {};
    pkg.yg.parser = parserName;
    try {
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2));
      console.log('更新编译器成功');
    } catch (error) {
      console.log('更新编译器名失败');
    }
  });
  socket.emit('clientEvent', new PM(eventconsts.cli.check, {parserName}));
}

module.exports.init = function (argv) {
  util.getConnect(argv).then(socket => {
    init(socket, argv);
  });
};
