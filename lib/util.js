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

const util = {
    program: {},
    ygConfig: {},
    sysTempDir: "",
    currentFolder: "",

    tarFolder(folderPath, targetPath) {
        console.log("打包中");
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
            console.log("上传中");
            let formData = {
                id: util.ygConfig.id,
                platform: util.ygConfig.platform,
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
    sendCmd() {
        return new Promise((resolve, reject) => {
            console.log("命令执行中");
            request.post({
                json: true,
                url: 'http://yg.jd.com/api/compile',
                formData: {
                    id: util.ygConfig.id,
                    platform: util.ygConfig.platform,
                    cmd: util.program.cmd
                }
            }, function (err, httpResponse, body) {
                if (err) {
                    console.log(err);
                    reject(body.stdout);
                }
                if (body.error) {
                    console.log(body.stdout);
                    reject(body.stdout);
                } else {
                    console.log(body.stdout);
                    resolve(body);
                }
            });
        })
    },

    customCmd(cmd) {
        return new Promise((resolve, reject) => {
            console.log("命令执行中");
            request.post({
                json: true,
                url: 'http://yg.jd.com/api/custom',
                formData: {
                    id: util.ygConfig.id,
                    platform: util.ygConfig.platform,
                    cmd: cmd
                }
            }, function (err, httpResponse, body) {
                if (err) {
                    console.log(err);
                    reject(body.stdout);
                }
                if (body.error) {
                    console.log(body.stdout);
                    reject(body.stdout);
                } else {
                    console.log(body.stdout);
                    resolve(body);
                }
            });
        })
    },
};

module.exports = util;