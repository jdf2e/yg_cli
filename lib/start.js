const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const ssfile = require('./ssfile');
const sync = require('./sync');
const util = require('./util');
function start(socket, argv) {
  return new Promise((res, rej)=>{
    const config = require('./ygconfig')(argv);
    ssfile.uploadproj(socket, argv)
    .then(() => {
      // 监听本地客户端输入，提供交互能力
      util.hasStd && process.stdin.on('data', (input) => {
        socket.emit('stdin', input.toString());
      });

      socket.on('web-container-launch', function (data) {
        res(data)
      })

      socket.on('msg', function (data) {
        util.hasStd && process.stdout.write(data);
      });
      
      socket.on('disconnect', () => {
        util.hasStd && process.stdin.destroy();
      });

      // 开始执行start流程
      socket.emit('clientEvent', new PM(eventconsts.start, argv, config));

      // 监听本地文件变更
      const watcher = sync.watchToSendRemote(socket, argv.dirname);

      // 断开链接后的处理
      socket.on('disconnect', () => {
        watcher.close();
        // 由于close不好使，还是劫持了terminal，直接强制退出
        process.exit(1);
      });
    })
    .catch((error) => {
      socket.disconnect();
      rej(error)
    })
  })
}

module.exports.start = function (argv) {
  return new Promise((res, rej)=>{
    util.getConnect(argv).then(socket => {
      start(socket, argv).then((result)=>{
        res(result)
      }).catch((error)=>{
        rej(error)
      })
    })
  })
}
