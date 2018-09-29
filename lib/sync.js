
const fs = require('fs');
const path = require('path');
const tarfs = require('tar-fs');
const ss = require('socket.io-stream');
const watch = require('node-watch');
const ignore = require('./ignore');
const eventconsts = require('./eventconsts');

module.exports.watchToSendRemote = function (socket, projPath) {
  return watch(projPath, {
    recursive: true,
    filter: (name) => {
      return !ignore.isIgnored(path.relative(projPath, name));
    }
  }, (evt, name) => {
    // 存在批量更新时不能及时响应以及性能问题，最好是做一个缓冲区
    console.log(evt, name);
    const relativefilepath = path.relative(projPath, name);
    if (evt === 'remove') {
      socket.emit(eventconsts.uploadwatch, {
        evt,
        file: relativefilepath
      });
    } else {
      const watchstream = ss.createStream();
      const watchpack = tarfs.pack(projPath, {
        entries: [relativefilepath]
      });
      ss(socket).emit(eventconsts.uploadwatch, watchstream, {
        evt,
        file: relativefilepath
      });
      watchpack.pipe(watchstream);
    }
  });
};

module.exports.listenToReceiveRemote = function (socket, projPath) {
  // 监听删除操作
  socket.on(eventconsts.uploadwatch, ({evt, file}) => {
    try {
      const filepath = path.resolve(projPath, file);
      if (evt === 'remove') {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      // nothing to do
    }
  });
  // 监听更新操作
  ss(socket).on(eventconsts.uploadwatch, (stream, data) => {
    const filepath = path.resolve(projPath, data.file);
    const targetDir = path.dirname(filepath);
    stream.pipe(tarfs.extract(targetDir));
  });
};
