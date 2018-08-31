/**
 * 启动监听命令行输入
 * @param {*} socket
 */
const start = function (socket) {
  process.stdin.on('data', (input) => {
    socket.emit('stdin', input.toString());
  });
}

const close = function () {
  try {
    process.stdin.off('data');
  } catch (e) {
    // nothing
  }
}

module.exports = {
  start: start,
  close: close
}
