'use strict';

var fs = require('fs'),
  cfs = require('co-fs'),
  path = require('path'),
  parse = require('co-busboy'),
  uuid = require('node-uuid'),
  mime = require('mime');

exports.files = function *filesUpload(next) {
  var parts = parse(this, { autoFields: true, limits: { fileSize: 5000000, files: 10 } }),
    files = [],
    requestPath = path.join(path.dirname(require.main.filename), '/public/', this.id),
    part,
    err;

  yield cfs.mkdir(requestPath);

  while ((part = yield parts)) {

    part.uuid = uuid.v1();
    part.writeStream = fs.createWriteStream(path.join(requestPath, part.uuid + '.' + mime.extension(part.mime)));
    part.pipe(part.writeStream);

    files.push({
      fieldname: part.fieldname,
      filename: part.filename,
      mime: part.mime,
      fileId: part.uuid,
      path: path.join('/public/', this.id, part.uuid + '.' + mime.extension(part.mime)),
      writeStream: part.writeStream
    });
  }

  this.req.files = files;
  this.req.field = parts.field;

  try {
    yield next;
  } catch (e) {
    err = e;
  }

  if (err) {

    // If there's an error we delete all the files
    // We should have some sort of periodical cleanup task for missed files
    try {
      for (var i = files.length - 1; i >= 0; i--) {
        yield cfs.unlink(path.join(path.dirname(require.main.filename), files[i].path));
      }
      yield cfs.rmdir(path.join(path.dirname(require.main.filename), '/public/', this.id));
    } catch (e) {
      console.warn('ERROR DELETING FILES: ', e);
    }

    // Once the files are all deleted we throw the error for someone upstream
    throw err;
  }

};
