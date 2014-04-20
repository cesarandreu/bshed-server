'use strict';

var fs = require('fs'),
  cfs = require('co-fs'),
  path = require('path'),
  parse = require('co-busboy'),
  uuid = require('node-uuid'),
  mime = require('mime'),
  _ = require('lodash');

/**
 * This middleware is in place to prevent the form co-busboy from freezing
 */
exports.safe = function *safe(next) {
  var methods = ['PUT', 'DELETE', 'POST'];

  if (_.contains(methods, this.method) && !this.request.is('multipart/*')) {
    this.status = 400;
    this.body = { error: 'Forms must be multipart/form-data' };
  } else {
    yield next;
  }
};

/**
 * This middleware handles file uploads
 * If any action after throws an error, the uploaded files are deleted
 */
exports.files = function *filesUpload(next) {
  var parts = parse(this, { autoFields: true, limits: {
      fileSize: (this.app.config.upload.fileSizeLimit),
      files: (this.app.config.upload.filesLimit)
    }}),
    files = [],
    requestPath = path.join(
      path.dirname(require.main.filename),
      this.app.config.upload.folder, this.id
    ),
    part,
    err;

  yield cfs.mkdir(requestPath);

  while ((part = yield parts)) {

    part.uuid = uuid.v1();
    part.writeStream = fs.createWriteStream(
      path.join(requestPath, part.uuid + '.' + mime.extension(part.mime))
    );
    part.pipe(part.writeStream);

    files.push({
      fieldname: part.fieldname,
      filename: part.filename,
      mime: part.mime,
      fileId: part.uuid,
      path: path.join(
        this.app.config.upload.folder,
        this.id, part.uuid + '.' + mime.extension(part.mime)
      ),
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
        var rmFile = path.join(
          path.dirname(require.main.filename),
          files[i].path
        );
        yield cfs.unlink(rmFile);
      }

      var rmDirectory = path.join(
        path.dirname(require.main.filename),
        this.app.config.upload.folder,
        this.id
      );
      yield cfs.rmdir(rmDirectory);
    } catch (e) {
      console.warn('ERROR DELETING FILES: ', e);
    }

    // Once the files are all deleted we throw the error for someone upstream
    throw err;
  }

};

/**
 * This middleware handles form parsing
 */
exports.form = function *form(next) {
  var parts = parse(this, {
      autoFields: true,
      limits: {
        files: 1,
        fileSize: 1
      }
    }),
    part;

  // If there's a file upload it will do resume() on the stream so it gets thrown away
  while((part = yield parts)) {
    part.resume();
  }

  this.req.field = parts.field;

  yield next;
};
