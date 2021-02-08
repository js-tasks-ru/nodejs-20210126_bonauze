const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const PATH_TO_FILES = path.join(__dirname, 'files');

const removeFile = (filepath) => {
  fs.unlink(filepath, (error) => {
    if (error) {
      console.error(error);
    }
  })
};

const saveFileByStream = (req, res, filepath, limit = Infinity) => {
  const limitStream = new LimitSizeStream({ limit });
  const writingStream = fs.createWriteStream(filepath);

  req.on('data', (chunk) => {
    if (!limitStream.write(chunk)) {
      req.pause();
      limitStream.once('drain', () => {
        req.resume();
      });
    }
  });

  req.on('error', () => {
    removeFile(filepath);
    res.status = 500;
    res.end(JSON.stringify({ error: true, message: 'File write error' }));
  });

  req.on('end', () => {
    res.statusCode = 201;
    res.end(JSON.stringify({ filepath }));
  });

  req.on('aborted', () => {
    removeFile(filepath);
    req.destroy();
  });

  limitStream.on('data', (chunk) => {
    if (!writingStream.write(chunk)) {
      limitStream.pause();
      writingStream.once('drain', () => {
        limitStream.resume();
      });
    }
  });

  limitStream.on('error', (error) => {
    removeFile(filepath);
    if (error instanceof LimitExceededError) {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: true, message: 'The file is large' }));
      return;
    }
    res.statusCode = 500;
    res.end();
  });
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(PATH_TO_FILES, pathname);

  if (pathname.includes('/') || filepath.indexOf(PATH_TO_FILES) !== 0) {
    res.statusCode = 400;
    res.end();
    return;
  }

  switch (req.method) {
    case 'POST':
      fs.stat(filepath, (error) => {
        if (!error) {
          res.statusCode = 409;
          res.end(JSON.stringify({ error: true, message: 'File exists' }));
          return;
        }
        saveFileByStream(req, res, filepath, 1000000);
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
