const fs = require("fs");
const connect = require('./connect')
let connectInstance
let dirname 
const util = {
    init( argv={}, callback ) {
        this.setDirname(argv)
        callback || callback (argv)
    },
    setDirname(argv={}){
        try {
            if ( ! fs.statSync(argv.dirname).isDirectory() ) {
                throw new Error()
            }
        } catch( e ) {
            argv.dirname = process.cwd()
        }

        if ( dirname != argv.dirname ) {
            console.log('当前运行环境目录为：', argv.dirname);
            dirname = argv.dirname
        }
    },
    getConnect(argv={}){
        if ( !connectInstance ) {
            this.setDirname(argv)
            connectInstance = connect(argv)
        }
        return connectInstance
    }
}
module.exports = util