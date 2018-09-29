const fs = require('fs');
const path = require('path');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const config = require('./ygconfig');
const ignore = require('./ignore');

/**
 * 如果调用了这条命令，注意整个流程的异步问题
 * @param {*} socket socket
 * @param {*} argv 命令行参数
 * @return {Promise} promise
 */
function uploadproj(socket, argv) {
  return new Promise((resolve, reject) => {
    socket.emit('clientEvent', new PM(eventconsts.uploadproj, argv, config), () => {
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
        resolve();
      });
      netstream.on('error', () => {
        reject();
      });
    });
  });
}

module.exports.uploadproj = uploadproj;
