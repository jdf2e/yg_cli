const minimatch = require('minimatch');

const ignore = {
  dir: ['.jdf-temp','doc', '..', '.git', '.svn', 'node_modules', 'Thumbs', 'DS_Store', '.db', 'bower_components', '.vscode', '.idea'],
  file: ['.DS_Store'],
  extname: ['dll', 'ini', 'sys', 'exe', 'psd', 'ai'],
  glob: ['node-watch*/**', 'node-watch**']
};

module.exports.addIgnore = function (name, type) {
  ignore[type].push(name);
};

module.exports.getIgnore = function () {
  return JSON.parse(JSON.stringify(ignore));
};

const getIgnorePattern = module.exports.getIgnorePattern = function () {
  return ignore.glob
  .concat(ignore.file)
  .concat(ignore.dir.map(item => (item + '/**')))
  .concat(ignore.extname.map(item => ('**/*.' + item)));
};

module.exports.isIgnored = function (relativepath) {
  return getIgnorePattern().reduce((prev, pat) => {
    return prev || minimatch(relativepath, pat, {
      dot: true,
      noext: true
    });
  }, false);
};
