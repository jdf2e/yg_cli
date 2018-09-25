module.exports = function ProtocolModel(cmd, options, args) {
  this.cmd = cmd || '';
  this.options = options || {};
  this.args = args || {};
}
