const { EventEmitter } = require('events');

function archiver(format, options) {
  // Simple stream-like shim with chainable `file()` and `finalize()` methods
  const stream = new EventEmitter();
  stream.file = function () { return stream; };
  stream.finalize = function () { return Promise.resolve(); };
  return stream;
}

module.exports = archiver;
