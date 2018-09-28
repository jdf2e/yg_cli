const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const inquirer = require('inquirer');
const shelljs = require('shelljs');
const open = require('open');
const watch = require('node-watch');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');
const config = require('./ygconfig');
const ignore = require('./ignore');

function exec(socket, argv) {
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
      // open(url);
    });
    socket.on('disconnect', () => {
      process.stdin.destroy();
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
      socket.emit('clientEvent', new PM(eventconsts.npm, argv, config));

      // 监听删除操作
      socket.on(eventconsts.uploadwatch, ({evt,file}) => {
        try {
          const filepath = path.resolve(process.cwd(), file);
          if (evt === 'remove') {
            fs.unlinkSync(filepath);
          }
        } catch (error) {
          // nothing to do
        }
      });
      // 监听更新操作
      ss(socket).on(eventconsts.uploadwatch, (stream, data) => {
        const filepath = path.resolve(process.cwd(), data.file);
        const targetDir = path.dirname(filepath);
        stream.pipe(tarfs.extract(targetDir));
      });

      // 断开链接后的处理
      socket.on('disconnect', () => {
        process.stdin.destroy();
      });
    });
  });
}

module.exports.exec = function (argv) {
  connect.then(socket => {
    exec(socket, argv);
  });
};
