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
            console.log('pwd is', argv.dirname);
            dirname = argv.dirname
        }
    },
    getConnect(argv={}){
        if ( !connectInstance ) {
            this.setDirname(argv)
            connectInstance = connect(argv)
            connectInstance.then((socket)=>{
                // console.info('socket is open !')
                socket.on('disconnect', ()=>{
                    // console.info('socket is closed !')
                    connectInstance = null
                })
            })
        }
        return connectInstance
    },
    hasStd:(()=>{
        try {return !!process.stdin} catch (e){return false}
    })()
}
module.exports = util