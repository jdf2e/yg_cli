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


const npm = {
    run() {


    }
};
module.exports = npm;