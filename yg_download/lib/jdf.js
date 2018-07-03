const fs = require("fs");
const path = require("path");
const uuidv4 = require('uuid/v4');
const shelljs = require("shelljs");
const tar = require("tar");
const request = require("request");
const watch = require('node-watch');
const os = require("os");
const opn = require('opn');
const kill = require('tree-kill');
const util = require("./util");
const npm = require("./npm");

const jdf = {
    run() {
        let f = path.join(util.currentFolder, util.ygConfig.id + '.tgz');
        util.tarFolder(util.currentFolder, f).then(d => {
            return util.uploadTar(f);
        }).then(d => {
            shelljs.rm("-rf", f);
            return util.sendCmd();
        }).then(d => {
            console.log("At URL:", `http://yg.jd.com/yg_src/${util.ygConfig.id}`);
            if (util.program.autoopen) {
                if (util.program.cmd == "output") {
                    opn(`http://yg.jd.com/yg_src/${util.ygConfig.id}`)
                }
                if (util.program.cmd == "build") {
                    opn(`http://yg.jd.com:${d.port}`)
                }

            }
        })
    }
};
module.exports = jdf;