const fs = require('fs');
const path = require('path');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');

function clean(socket, argv) {
  let ygconfig = {};
  try {
    ygconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.ygconfig')).toString());
  } catch (error) {
    // nothing
  }

  socket.on(eventconsts.clean, protocol => {
    if (protocol.args.isOK) {
      console.log('清理成功，项目文件，编译器，以及安装的node_modules均已清除');
    } else {
      console.log('清理过程出现问题，请重新清理');
    }
    socket.disconnect();
  });
  console.log('开始清理');
  socket.emit('clientEvent', new PM(eventconsts.clean, argv, ygconfig));
}

module.exports.clean = function (argv) {
  connect.then(socket => {
    clean(socket, argv);
  });
};
