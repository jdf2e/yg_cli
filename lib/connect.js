const fs = require('fs');
const path = require('path');
const io = require('socket.io-client');

const eventconsts = require('./eventconsts');

function connect(argv) {
  const ygconfig = require('./ygconfig')(argv);
  return new Promise((resolve, reject) => {
    try {
      const socket = io(ygconfig.ygconfig.domain || ygconfig.DOMAIN, {
        timeout: ygconfig.connect_timeout,
        transports: ['websocket']
      });
      socket.on('connect', () => {
        resolve(socket);
      });

      // TODO 暂时不作版本检测
      // socket.on(eventconsts.yg_version_sync, serverVersion => {
      //   let clientVersion = '';
      //   try {
      //     const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString());
      //     clientVersion = pkg.version;
      //   } catch (error) {
      //     // nothing
      //   }
      //   if (serverVersion && clientVersion !== serverVersion) {
      //     console.log('客户端与服务端版本不匹配，请更新到和服务端相同的版本');
      //     console.log('------');
      //     console.log(`  npm install yg-cli@${serverVersion}`);
      //     console.log('------');
      //     process.exit(1);
      //   }
      // });

      socket.on('connect_error', (error) => {
        console.log('connect error');
        console.log(`无法连接的云服务地址${ygconfig.ygconfig.domain || ygconfig.DOMAIN}`);
        reject(error);
        socket.close();
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = connect;
