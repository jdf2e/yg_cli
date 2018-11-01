// const io = require('socket.io-client');
// const socket = io('http://127.0.0.1');


// socket.on('connect', function () {
//     console.log("connected");
//     socket.emit("runshell", {
//         id: "aaaa-aaa-aaa3322",
//         cmd: ["hs"],
//     })
// });

// socket.on('msg', function (data) {
//     console.log(data);
// });

// socket.on('disconnect', function () {});

// const request = require("request");
// const fs = require("fs");
// request(`http://localhost/download?puuid=da0265b9-c431-486d-bf4b-4e0a77a1397c&folder=test`).pipe(
//     fs.createWriteStream("a.tgz").on("finish", function (e) {
//         console.log("findish")
//     })
// );

// var open = require("open");
// open("https://www.jd.com" );

// console.log(open);

// const argv = require('yargs')
// .default('dirname', process.cwd())
// .command('build', '编译并下载编译后的文件到本地dist目录', function(){}, function (argv) {
//     console.info('build',argv)
//   })
//   .command('abc', 'ABC', function(argv){
//     argv.reset()
//     .options('all', {
//       alias: 'a',
//       describe: '展示所有编译器列表',
//       type: 'boolean'
//     });
//   }, function (argv) {
//     console.info('abc', argv)
//   })
//   .argv