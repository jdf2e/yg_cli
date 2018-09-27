const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const inquirer = require('inquirer');
const shelljs = require('shelljs');
const open = require('open');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');
const config = require('./ygconfig');
const ignore = require('./ignore');

function start(socket, argv) {
  // 告知后端接收通知
  socket.emit('clientEvent', new PM(eventconsts.uploadproj, argv, config), (data) => {
    // 监听本地客户端输入，提供交互能力
    process.stdin.on('data', (input) => {
      socket.emit('stdin', input.toString());
    });
    socket.on('msg', function (data) {
        process.stdout.write(data);
    });
    socket.on('open', (url) => {
      open(url);
    });

    // 将需要上传到云服务的文件打包
    const mypack = tarfs.pack(process.cwd(), {
      ignore: (name) => {
        return ignore.isIgnored(path.relative(process.cwd(), name));
      }
    });
    const netstream = ss.createStream();
    ss(socket).emit(eventconsts.uploadproj, netstream);
    mypack.pipe(netstream);

    // 传输完毕
    netstream.on('end', () => {
      // 开始执行start流程
      socket.emit('clientEvent', new PM(eventconsts.start, argv, config));
      socket.on('disconnect', () => {
        console.log('disconnected');
        process.stdin.destroy();
      });
    });
  });
}

module.exports.start = function (argv) {
  connect.then(socket => {
    start(socket, argv);
  });
};
