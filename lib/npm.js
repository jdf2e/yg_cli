const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const ssfile = require('./ssfile');
const sync = require('./sync');
const util = require('./util');

function exec(socket, argv) {
  const config = require('./ygconfig')(argv);
  ssfile.uploadproj(socket, argv)
  .then(() => {
    // 监听本地客户端输入，提供交互能力
    util.hasStd && process.stdin.on('data', (input) => {
      socket.emit('stdin', input.toString());
    });

    socket.on('msg', function (data) {
      util.hasStd && process.stdout.write(data);
    });

    socket.on('open', (url) => {
      // open(url);
    });

    // 断开链接后的处理
    socket.on('disconnect', () => {
      util.hasStd && process.stdin.destroy();
    });

    // 开始执行npm流程
    socket.emit('clientEvent', new PM(eventconsts.npm, argv, config));

    // 监听远端变化并同步到本地
    sync.listenToReceiveRemote(socket, argv.dirname);
  })
  .catch(() => {
    socket.disconnect();
  });
}

module.exports.exec = function (argv) {
  util.getConnect(argv).then(socket => {
    exec(socket, argv);
  });
};
