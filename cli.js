#!/usr/bin/env node

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
const util = require('./lib/util');
const jdf = require('./lib/jdf');

program
    .version('0.1.0')
    .usage('yg -p jdf -c build -w -a')
    .option('-p, --platform <n>', '指定平台')
    .option('-c, --cmd <c>', '指定编译命令，目前为 output 或 build')
    .option('-w, --watch', '监听本地目录，变换后自动同步')
    .option('-a, --autoopen', '自动打开浏览器')
    .parse(process.argv);

let currentFolder = process.cwd();
let ygConfig = {};
let ygConfigPath = path.join(currentFolder, "yg.config")

if (!fs.existsSync(ygConfigPath)) {
    if (!program.platform) {
        console.log("platform not specified!");
        return;
    }
    ygConfig.platform = program.platform;
    ygConfig.id = uuidv4();
    ygConfig.create = +new Date();
    fs.writeFileSync(ygConfigPath, JSON.stringify(ygConfig, null, 2), "utf-8");
} else {
    ygConfig = JSON.parse(fs.readFileSync(ygConfigPath));
}

const sysTempDir = path.join(os.tmpdir(), "yg_cli", ygConfig.id);


util.program = program;
util.ygConfig = ygConfig;
util.sysTempDir = sysTempDir;
util.currentFolder = currentFolder;
program.cmd = program.cmd || "output";



 

switch (ygConfig.platform) {
    case "jdf":
        jdf.run();
        break;
}

if (program.watch) {
    let changeArr = [];
    let timeOut;
    watch(currentFolder, {
        recursive: true,
        filter: f => !/\.tgz$/.test(f),
    }, function (evt, name) {
        changeArr.push(name);
        clearTimeout(timeOut);
        timeOut = setTimeout(s => {
            shelljs.rm("-rf", sysTempDir);
            changeArr.map(file => {
                let n = file.replace(currentFolder, "");
                let targetF = path.join(sysTempDir, n);
                let dir = path.dirname(targetF);
                shelljs.mkdir("-p", dir);
                shelljs.cp(file, targetF);
                let tarFile = path.join(sysTempDir, ygConfig.id + '.tgz');
                console.log(tarFile);
                util.tarFolder(sysTempDir, tarFile).then(d => {
                    return util.uploadTar(tarFile);
                }).then(d => {

                });
            });
            console.log(changeArr);
            changeArr = [];
        }, 1000);
    });
}