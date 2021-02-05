const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._data = '';
  }

  _transform(chunk, encoding, callback) {
    this._data += chunk.toString();
    const lines = this._data.split(os.EOL);

    if (lines.length === 1) {
      callback();
      return;
    }

    const lastLinesIndex = lines.length - 1;

    lines.forEach((line, index) => {
      if (index !== lastLinesIndex) {
        this.push(line);
      } else {
        this._data = line;
      }
    });

    callback();
  }

  _flush(callback) {
    this._data.split(os.EOL).forEach(this.push.bind(this));
    callback();
  }
}

module.exports = LineSplitStream;
