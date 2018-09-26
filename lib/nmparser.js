const fs = require('fs');
const path = require('path');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');

function list(socket, argv) {
  socket.on(eventconsts.cli.list, protocol => {
    console.log(protocol.args.list, protocol.args.isErr);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.cli.list, argv));
}

function check(socket, argv) {
  socket.on(eventconsts.cli.check, protocol => {
    console.log('isExsit:', protocol.args.isExsit);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.cli.check, argv));
}

module.exports.list = function (argv) {
  connect.then(socket => {
    list(socket, argv);
  });
}
module.exports.check = function (argv) {
  connect.then(socket => {
    check(socket, argv);
  });
}
