const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');
const config = require('./ygconfig');
const ssfile = require('./ssfile');
const sync = require('./sync');

function exec(socket, argv) {
  ssfile.uploadproj(socket, argv)
  .then(() => {
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

    // 开始执行build流程
    socket.emit('clientEvent', new PM(eventconsts.build, argv, config));

    // 监听远端变化并同步到本地
    sync.listenToReceiveRemote(socket, process.cwd());

    // 断开链接后的处理
    socket.on('disconnect', () => {
      process.stdin.destroy();
    });
  })
  .catch(() => {
    socket.disconnect();
  });
}

module.exports.exec = function (argv) {
  connect.then(socket => {
    exec(socket, argv);
  });
};
