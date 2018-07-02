const fs = require("fs");
const program = require('commander');
const path = require("path");
const uuidv4 = require('uuid/v4');
const shelljs = require("shelljs");
const tar = require("tar");
const request = require("request");
const watch = require('node-watch');
const os = require("os");
const opn = require('opn');
const kill = require('tree-kill');
const io = require('socket.io-client');

let currentFolder = process.cwd();

const util = {
    socket: null,
    ygConfigPath: "",
    ygConfig: {
        puuid: "",
        prot: "",
        nv: "",
    },
    sysTempDir: "",
    currentFolder: "",



    cmdArgs(argsArr) {
        if (argsArr.length <= 0 || argsArr[0] == "-h" || argsArr[0] == "-help") {
            util.help();
            return;
        }
        util.addignore();
        let ygConfigArgs = [];
        let userConfigArgs = [];
        let boolSwitch = [];
        for (let i = 0; i < argsArr.length; i++) {
            let c = argsArr[i];
            if (c[0] != "-") {
                let preArg = argsArr[i - 1];
                if (!preArg || preArg[0] != "-" || boolSwitch.includes(preArg)) {
                    userConfigArgs = argsArr.slice(i);
                    break;
                }
            }
            ygConfigArgs.push(c);
        };

        ygConfigArgs.map((v, i) => {
            if (v == "-p") {
                util.ygConfig.prot = ygConfigArgs[i + 1];
            }
            if (v == "-nv") {
                util.ygConfig.nv = ygConfigArgs[i + 1];
            }
        });

        //console.log(ygConfigArgs);
        //console.log(userConfigArgs);

        const socket = util.socket = io('http://yg.jd.com');

        socket.on('connect', function () {
            console.log("socket connected.");
            fs.writeFileSync(util.ygConfigPath, JSON.stringify(util.ygConfig, null, 2), "utf-8");

            if (userConfigArgs.length > 0) {
                let f = path.join(util.currentFolder, util.ygConfig.puuid + '.tgz');
                util.tarFolder(util.currentFolder, f).then(d => {
                    return util.uploadTar(f);
                }).then(d => {
                    shelljs.rm("-rf", f);
                    return util.sendCmd(socket, util.ygConfig, userConfigArgs);
                }).then(d => {
                    //console.log("At URL:", `http://yg.jd.com/yg_src/${util.ygConfig.id}`);
                })
            } else {
                console.log("no shell to exec");
                socket.disconnect();
            }
            util.startWatch();
        });

        socket.on('msg', function (data) {
            console.log(data);
        });
        socket.on('err', function (data) {
            console.log(data);
            socket.disconnect();
        });
        socket.on('selfclose', function (data) {
            console.log(data);
        });

        socket.on('disconnect', function () {});
    },


    addignore() {
        let ignoreFile = path.join(util.currentFolder, ".gitignore");
        if (fs.existsSync(ignoreFile)) {
            let content = fs.readFileSync(ignoreFile, "utf-8");
            content += "\r\n" + ".ygconfig";
            fs.writeFileSync(ignoreFile, content, "utf-8");
        }

        //.gitignore
    },

    tarFolder(folderPath, targetPath) {
        //console.log("打包中");
        let folders = shelljs.ls(folderPath);
        folders = [...folders];
        return tar.c({
            gzip: true,
            file: targetPath,
            filter: function (p, stat) {
                return p !== "node_modules" && !/.tgz$/ig.test(p)
            }
        }, folders).then(d => {
            return targetPath;
        })
    },

    uploadTar(tarFile) {
        return new Promise((resolve, reject) => {
            //console.log("上传中");
            let formData = {
                puuid: util.ygConfig.puuid,
                file: fs.createReadStream(tarFile),
            };
            request.post({
                url: 'http://yg.jd.com/api/upload',
                formData: formData
            }, function (err, httpResponse, body) {
                if (err) {
                    console.error('upload failed:', err);
                    reject(err);
                }
                if (!body.error) {
                    resolve(body);
                }
            });
        })
    },
    sendCmd(socket, config, cmdArr) {
        return new Promise((resolve, reject) => {
            //console.log("命令执行中");
            socket.emit("runshell", {
                config,
                cmdArr,
            })
        })
    },



    help() {
        console.log("yg:");
        console.log("   -nv    指定运行的 nodejs 版本，当前支持：6.14.3 |  8.11.3  |  10.5.0");
        console.log("   -p     指定运行时，平台自动对接的本地端口号，默认为 8080");

        console.log("使用方法:");
        console.log("   yg [-nv] <arg> [-p] <arg> some shell or cmd write here");
        console.log("举例:");
        console.log("   yg  -nv 8.11.3 -p 8080 npm run my_build_script");
        console.log("   yg  npm run my_build_script");
    },

    startWatch() {
        let changeArr = [];
        let timeOut;
        watch(currentFolder, {
            recursive: true,
            filter: f => !/\.tgz$/.test(f),
        }, function (evt, name) {
            changeArr.push(name);
            clearTimeout(timeOut);
            timeOut = setTimeout(s => {
                shelljs.rm("-rf", util.sysTempDir);
                changeArr.map(file => {
                    let n = file.replace(currentFolder, "");
                    let targetF = path.join(util.sysTempDir, n);
                    let dir = path.dirname(targetF);
                    shelljs.mkdir("-p", dir);
                    shelljs.cp(file, targetF);
                    let tarFile = path.join(util.sysTempDir, ygConfig.id + '.tgz');
                    console.log(tarFile);
                    util.tarFolder(util.sysTempDir, tarFile).then(d => {
                        return util.uploadTar(tarFile);
                    }).then(d => {

                    });
                });
                console.log(changeArr);
                changeArr = [];
            }, 1000);
        });
    }

};

module.exports = util;