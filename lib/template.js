const fs = require('fs');
const path = require('path');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const util = require('./util')

function list(socket, argv) {
  socket.on(eventconsts.template.list, protocol => {
    console.log(protocol.args.list);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.template.list, argv));
}

function clone(socket, argv) {
  const targetDir = path.resolve(argv.dirname, argv.name);
  if (fs.existsSync(targetDir)) {
    console.log(`已存在${argv.name}文件夹，复制失败。${targetDir}`);
    socket.disconnect();
  }

  ss(socket).on(eventconsts.template.clone, (stream) => {
    console.log('received stream');
    stream.pipe(tarfs.extract(targetDir));
  });
  socket.on(eventconsts.template.clone, protocol => {
    if (protocol.args.isErr) {
      console.log(`复制模板${protocol.options.name}时发生错误，错误原因待完善`);
      socket.disconnect();
      return;
    }

    console.log('模板下载成功');
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.template.clone, argv));
}

module.exports.list = function (argv) {
  util.getConnect(argv).then(socket => {
    list(socket, argv);
  });
};

module.exports.clone = function (argv) {
  util.getConnect(argv).then(socket => {
    clone(socket, argv);
  });
};
