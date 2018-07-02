const io = require('socket.io-client');
const socket = io('http://127.0.0.1');


socket.on('connect', function () {
    console.log("connected");
    socket.emit("runshell", {
        id: "aaaa-aaa-aaa3322",
        cmd: ["rm","-f","xxx.txt"],
    })

});
socket.on('msg', function (data) {
    console.log(data);
});

socket.on('disconnect', function () {});