const io = require('socket.io-client');
const ygconfig = require('./ygconfig');

function connect() {
  return new Promise((resolve, reject) => {
    try {
      const socket = io(ygconfig.ygconfig.domain || ygconfig.DOMAIN, {
        timeout: ygconfig.connect_timeout
      });
      socket.on('connect', () => {
        resolve(socket);
      });

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

module.exports = connect();
