const PM = require('./ProtocolModel');
const eventconsts = require('./eventconsts');
const connect = require('./connect');

function list(socket) {
  socket.on(eventconsts.template.list, protocol => {
    console.log(protocol.args.list);
    socket.disconnect();
  });

  socket.emit('clientEvent', new PM(eventconsts.template.list, null));
}

connect.then(socket => {
  list(socket);
})
