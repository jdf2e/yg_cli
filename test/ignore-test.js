const path = require('path');
const minimatch = require('minimatch');
const ignore = require('../lib/ignore');

const patterns = ignore.getIgnorePattern();

const falseCase = [
  'a/b.js',
  '/user/a/b',
  'src/node_modules/react/react.min.js',

  'a.scss',
  'src/app/index.js'
].map(item => (path.resolve(__dirname, item)));

// falseResult全false
let falseResult = falseCase.map(file => {
  const refile = path.relative(__dirname, file);
  const index = patterns.findIndex(pat => {
    return minimatch(refile, pat, {
      dot: true,
      noext: true
    });
  });

  if (index !== -1) {
    console.log(refile);
  }
  return index !== -1;
});
console.log('all false:', falseResult);


const trueCase = [
  'doc/a/b.js',
  '.git/hook',
  '.svn/main/a.py',
  'node_modules/react/package.json',
  'Thumbs/whate/c.doc',
  'DS_Store/aaaa',

  'a.dll',
  'src/app/index.exe',
  'user/man.exe'
].map(item => path.resolve(__dirname, item));

// trueResult全true
let trueResult = trueCase.map(file => {
  const refile = path.relative(__dirname, file);
  const index = patterns.findIndex(pat => {
    return minimatch(refile, pat, {
      dot: true,
      noext: true
    });
  });

  if (index === -1) {
    console.log(refile);
  }
  return index !== -1;
});
console.log('all true:', trueResult);
