const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');
const config = require('./config');
module.exports = function saveYgConfig(argv) {
  let ygconfig;
  let ygConfigPath = path.join(argv.dirname, '.ygconfig');
  try {
    ygconfig = JSON.parse(fs.readFileSync(ygConfigPath).toString());
  } catch (error) {
    ygconfig = {};
  }

  ygconfig.puuid = ygconfig.puuid || uuidv4();
  ygconfig.port = ygconfig.port || 8080;
  ygconfig.nv = ygconfig.nv || '8.11.3';
  ygconfig.create = ygconfig.create || +new Date();
  ygconfig.domain = ygconfig.domain || 'http://yg.jd.com';
  fs.writeFileSync(ygConfigPath, JSON.stringify(ygconfig, null, 2));

  config.ygconfig = ygconfig;
};
