const { EventEmitter } = require('events');

class ZipArchive extends EventEmitter {
  constructor(options) {
    super();
  }
  file() { return this; }
  finalize() { return Promise.resolve(); }
}

module.exports = { ZipArchive };
