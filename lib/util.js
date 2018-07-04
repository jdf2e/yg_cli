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
        port: "",
        nv: "",
    },
    sysTempDir: "",
    currentFolder: "",

    saveYgConfig() {
        let cfg = {
            puuid: util.ygConfig.puuid,
            port: util.ygConfig.port,
            nv: util.ygConfig.nv,
            outerPort: util.ygConfig.outerPort,
        };

        fs.writeFileSync(util.ygConfigPath, JSON.stringify(cfg, null, 2), "utf-8");
    },

    cmdArgs(argsArr) {
        if (argsArr.length <= 0 || argsArr[0] == "-h" || argsArr[0] == "-help") {
            util.help();
            return;
        }
        util.addignore();
        let ygConfigArgs = [];
        let userConfigArgs = [];
        let boolSwitch = ["-o"];
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
                util.ygConfig.port = ygConfigArgs[i + 1];
            }
            if (v == "-nv") {
                util.ygConfig.nv = ygConfigArgs[i + 1];
            }
            if (v == "-d") {
                util.ygConfig.d = ygConfigArgs[i + 1];
            }
            if (v == "-o") {
                util.ygConfig.open = true;
            }
            if (v == "-i") {
                util.ygConfig.i = true;
            }
        });

        // 打开浏览器 open
        if (util.ygConfig.open) {
            opn(`http://yg.jd.com/yg_src/${util.ygConfig.puuid}`);
            opn(`http://yg.jd.com:${util.ygConfig.outerPort}`);

        }

        //download 
        if (util.ygConfig.d) {
            util.download(util.ygConfig.d).then(d => {
                //process.exit();
            });
            return;
        }

        // show info
        if (util.ygConfig.i) {
            console.log(util.ygConfig);
            return;
        }

        //console.log(ygConfigArgs);
        //console.log(userConfigArgs);

        const socket = util.socket = io('http://yg.jd.com');

        socket.on('connect', function () {
            //console.log("socket connected.");
            util.saveYgConfig();
            if (userConfigArgs.length > 0) {
                let f = path.join(util.currentFolder, util.ygConfig.puuid + '.tgz');
                let folders = shelljs.ls("-A", util.currentFolder);
                folders = [...folders];
                util.tarFolder(util.currentFolder, folders, f).then(d => {
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

        socket.on('receive', function (data) {
            Object.assign(util.ygConfig, data);
            util.saveYgConfig();
            console.log("以下 log 信息来自云构 外部端口：", util.ygConfig.outerPort);
            console.log("----------------------------------------------------------");
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

        socket.on('disconnect', function () {
            console.log("----------------------------------------------------------");
            console.log("目录浏览：", `http://yg.jd.com/yg_src/${util.ygConfig.puuid}/`);
            console.log("云构 URL：", `http://yg.jd.com:${util.ygConfig.outerPort}`);
            process.exit();
        });
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

    tarFolder(cwd, folders, targetPath) {
        //console.log("打包中");
        return tar.c({
            gzip: true,
            file: targetPath,
            cwd: cwd,
            filter: function (p, stat) {
                return p !== "node_modules" &&
                    !/.tgz$/ig.test(p) &&
                    !/.git$/ig.test(p) &&
                    !/.svn$/ig.test(p)
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
        console.log("云构参数:");
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
                let tarFile = path.join(util.sysTempDir, util.ygConfig.puuid + '.tgz');
                shelljs.rm("-rf", util.sysTempDir);
                changeArr.map(file => {
                    let n = file.replace(currentFolder, "");
                    let targetF = path.join(util.sysTempDir, n);
                    let dir = path.dirname(targetF);
                    shelljs.mkdir("-p", dir);
                    shelljs.cp(file, targetF);
                });
                changeArr = [];
                let folders = [...shelljs.ls("-A", util.sysTempDir)];
                util.tarFolder(util.sysTempDir, folders, tarFile).then(d => {
                    return util.uploadTar(tarFile);
                }).then(d => {

                });

            }, 1000);
        });
    },

    download(folder = "") {
        return new Promise((resolve, reject) => {
            shelljs.mkdir("-p", util.sysTempDir);
            let targetFile = path.join(util.sysTempDir, util.ygConfig.puuid + ".tgz");
            request(`http://yg.jd.com/download?puuid=${util.ygConfig.puuid}&folder=${folder}`).pipe(
                fs.createWriteStream(targetFile).on("finish", function (e) {
                    let ygDownloadFolder = path.join(util.currentFolder, "yg_download");
                    shelljs.mkdir("-p", ygDownloadFolder);
                    tar.x({
                        file: targetFile,
                        C: ygDownloadFolder
                    }).then(d => {
                        console.log("download finished ", folder);
                        resolve(folder);
                    });

                })
            );
        });

    }
};

module.exports = util;