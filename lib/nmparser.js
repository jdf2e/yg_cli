const fs = require('fs');
const path = require('path');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const inquirer = require('inquirer');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const ssfile = require('./ssfile');
const util = require('./util');

function list(socket, argv) {
  socket.on(eventconsts.cli.list, protocol => {
    console.log(protocol.args.list, protocol.args.isErr);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.cli.list, argv));
}

function check(socket, argv) {
  socket.on(eventconsts.cli.check, protocol => {
    console.log('isExsit:', protocol.args.isExsit);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.cli.check, argv));
}

function freeze(socket, argv) {
  const config = require('./ygconfig')(argv);
  const parserName = argv.parserName;
  socket.on(eventconsts.cli.check, async protocol => {
    let isFreeze = true;
    if (!argv.force && protocol.args.isExsit) {
      await inquirer.prompt([{
        type: 'confirm',
        name: 'pass',
        message: `已存在编译器${parserName}模板, 是否覆盖?`
      }])
      .then(answers => {
        isFreeze = answers.pass;
      });
    }

    if (!isFreeze) {
      console.log('好的，咱们不固化编译器模板了');
      socket.disconnect();
      return;
    }

    ssfile.uploadproj(socket, argv)
    .then(() => {
      // 固化阶段可能存在交互命令
      process.stdin.on('data', (input) => {
        socket.emit('stdin', input.toString());
      });
      socket.on('msg', function (data) {
        process.stdout.write(data);
      });
      socket.on('disconnect', () => {
        process.stdin.destroy();
      });

      console.log('固化中，请等待...');

      socket.emit('clientEvent', new PM(eventconsts.cli.freeze, argv, config));
    })
    .catch(() => {
      socket.disconnect();
    });
  });

  socket.emit('clientEvent', new PM(eventconsts.cli.check, argv));
}

function remove(argv) {
  try {
    const pkg = JSON.parse(path.resolve(argv.dirname, 'package.json'));
    pkg.yg = pkg.yg || {};
    pkg.parser = '';
    JSON.stringify(pkg, null, 2);
  } catch (error) {
    console.log('解析package.json过程中出错，请确保package.json存在且合法');
  }
}

module.exports.list = function (argv) {
  util.getConnect(argv).then(socket => {
    list(socket, argv);
  });
};
module.exports.check = function (argv) {
  util.getConnect(argv).then(socket => {
    check(socket, argv);
  });
};
module.exports.freeze = function (argv) {
  util.getConnect(argv).then(socket => {
    freeze(socket, argv);
  });
};
module.exports.remove = function (argv) {
  util.setDirname(argv)
  remove(argv);
}
