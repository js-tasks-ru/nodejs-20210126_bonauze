const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PATH_TO_FILES = path.join(__dirname, 'files');

const server = new http.Server();

const sendFileByStream = (res, filepath) => {
  const stream = fs.createReadStream(filepath);

  stream.on('data', (chunk) => {
    if (!res.write(chunk.toString())) {
      stream.pause();
      res.once('drain', () => {
        stream.resume();
      });
    }
  });

  stream.on('error', ({code}) => {
    if (['ENOENT', 'EISDIR'].includes(code)) {
      res.statusCode = 404;
      res.end(JSON.stringify({error: true, message: 'Invalid file path'}));
      return;
    }
    res.statusCode = 500;
    res.end(JSON.stringify({error: true, message: 'Error reading file'}));
  });

  stream.on('end', () => {
    res.statusCode = 200;
    res.end();
  });

  stream.on('aborted', () => {
    stream.destroy();
  });
};

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = decodeURIComponent(path.join(PATH_TO_FILES, pathname));

  if (pathname.includes('/') || filepath.indexOf(PATH_TO_FILES) !== 0) {
    res.statusCode = 400;
    res.end();
    return;
  }

  switch (req.method) {
    case 'GET':
      sendFileByStream(res, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
