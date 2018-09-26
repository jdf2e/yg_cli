const fs = require('fs');
const path = require('path');
const ss = require('socket.io-stream');
const tarfs = require('tar-fs');
const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');

function init(socket, argv) {
  socket.on(eventconsts.init, protocol => {
    console.log(protocol.args.isErr);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.init, argv));
}

module.exports.init = function (argv) {
  connect.then(socket => {
    init(socket, argv);
  });
};
