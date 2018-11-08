const build = require('./lib/build');
const start = require('./lib/start');
const npm = require('./lib/npm');
const cmd = require('./lib/cmd');
const init = require('./lib/init');
const nmparser = require('./lib/nmparser');
const template = require('./lib/template');
const clean = require('./lib/clean');

// 编译并下载编译后的文件到本地dist目录
module.exports.build = (argv)=>{
    build.exec(argv);
}

// 启动web服务，热更新开发，映射到npm run dev
module.exports.start = (argv)=>{
    return new Promise((res, rej)=>{
        start.start(argv).then((data)=>{
            res(data)
        }).catch((error)=>{
            rej(error)
        })
    })
}

// 中转npm scripts命令
module.exports.npm = (argv)=>{
    npm.exec(argv);
}

// 中转cmd命令
module.exports.cmd = (argv)=>{
    cmd.exec(argv);
}


// 初始化工程，生成.ygconfig
// 或切换当前工程编译器
module.exports.init = (argv)=>{
    return new Promise((res, rej)=>{
        init.init(argv).then(()=>{
            res()
        }).catch(()=>{
            rej()
        })
    })
}

module.exports.cli = {
    list(argv){ // 编译器列表
        nmparser.list(argv);
    },
    check(argv){ // 检查编译器是否存在或正常工作
        nmparser.check(argv);
    },
    freeze(argv){ // 固化当前使用的环境为新编译器
        nmparser.freeze(argv);
    },
    remove(argv){ // 清除当前工程的编译器
        nmparser.remove(argv);
    }
}

// 脚手架模板管理
module.exports.template = {
    clone(argv){
        template.clone(argv);
    },
    upload(argv){

    },
    list(argv){
        template.list(argv);
    }
}

// 切换云服务器，不输入ip则查看当前连接的云服务器
module.exports.connect = (argv)=>{
    const fs = require('fs');
    const path = require('path');
    const ygconfig = require('./lib/ygconfig')(argv).ygconfig;
    const ygconfigFile = path.resolve(argv.dirname, '.ygconfig');
    if (argv.ip) {
        // todo 校验ip或域名的合法性
        ygconfig.domain = argv.ip;
        fs.writeFileSync(ygconfigFile, JSON.stringify(ygconfig, null, 2));
        console.log('新连接的云服务地址为：', argv.ip);
    } else {
        console.log('当前云服务地址为：', ygconfig.domain);
    }
}

// 清除服务端的缓存文件
module.exports.clean = (argv)=>{
    clean.clean(argv);
}