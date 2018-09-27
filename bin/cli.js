#!/usr/bin/env node

const yargs = require('yargs');

function noop() {}

function checkMiddleware(argv) {
  console.log('before command', argv);
}

yargs

.command('build', '编译并下载编译后的文件到本地dist目录', noop, function (argv) {
  console.log('excute some build action')
}, [checkMiddleware])

.command('start', '启动web服务，热更新开发，映射到npm run dev', noop, (argv) => {
  const start = require('../lib/start');
  start.start(argv);
})

.command('npm', '中转npm scripts命令')

.command('init <parserName>', '初始化工程，生成.ygconfig', noop, (argv) => {
  const init = require('../lib/init');
  init.init(argv);
})

.command('cli-list', '编译器列表', function (yargs) {
  yargs.reset()
  .options('all', {
    alias: 'a',
    describe: '展示所有编译器列表',
    type: 'boolean'
  });
}, (argv) => {
  const nmparser = require('../lib/nmparser');
  nmparser.list(argv);
})

.command('cli-check <parserName>', '检查编译器是否存在或正常工作', noop, (argv) => {
  const nmparser = require('../lib/nmparser');
  nmparser.check(argv);
})

.command('cli-freeze <parserName>', '固化当前使用的环境为新编译器', function (yargs) {
  yargs.reset()
  .options('f', {
    alias: 'force',
    describe: '如果已存在，仍旧强制覆盖固化',
    type: 'boolean'
  });
})

.command('cli-use <parserName>', '当前工程切换编译器', noop, (argv) => {
  const init = require('../lib/init');
  init.init(argv);
})

.command('template <options>', '脚手架模板管理', function (yargs) {
  yargs.reset()
    .command('clone <name>', '使用指定脚手架模板作为项目模板', noop, (argv) => {
      const template = require('../lib/template');
      template.clone(argv);
    })
    .command('upload', '上传脚手架', function (yargs) {
      yargs.reset()
      .option('path', {
        alias: 'p',
        type: 'string',
        describe: '自定义脚手架文件夹路径',
        demand: true
      })
      .option('name', {
        alias: 'n',
        type: 'string',
        describe: '自定义脚手架名称',
        demand: true
      });
    })
    .command('list', '展示脚手架列表，默认是系统提供的脚手架', function (yargs) {
      yargs.reset()
      .option('all', {
        alias: 'a',
        type: 'boolean',
        describe: '查看所有脚手架'
      });
    }, (argv) => {
      const template = require('../lib/template');
      template.list(argv);
    });
})

.command('connect [ip]', '切换云服务器，不输入ip则查看当前连接的云服务器')

.command('use', '')

.option('n', {
  alias: 'name',
  demand: false,
  describe: 'get name',
  type: 'string'
})
.option('f', {
  alias: 'find',
  demand: false,
  describe: 'ok',
  type: 'string'
})
.usage('Usage: hello [options]')
.example('yg -n ldspirit', 'say hellow to ldspirit')
.help('h')
.alias('h', 'help')
.epilog('copyright jdc_fe');

yargs.parse(process.argv.slice(2), function (err, argv, output) {
  if (err) {
    console.log(err.message);
  }
});
