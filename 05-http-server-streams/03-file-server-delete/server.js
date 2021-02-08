const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const PATH_TO_FILES = path.join(__dirname, 'files');

const deleteFile = (res, filepath) => {
  fs.unlink(filepath, (error) => {
    if (error) {
      res.statusCode = error.code === 'ENOENT' ? 404 : 500;
      res.end();
      return;
    }

    res.statusCode = 200;
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
    case 'DELETE':
      deleteFile(res, filepath);
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
