'use strict';

var parse = require('co-busboy'),
  bikesheds = require('../models/bikesheds');

exports.create = function *create() {

  // TODO: validation
  // Check that there's at least 2 files
  // All files must be mime type image
  // Check fields validation

  this.req.field.id = this.id;
  var result = bikesheds.create(this.req.field, this.req.files);
  this.body = result.new_val;

};

exports.list = function *list() {
  this.body = 'LIST';
};

exports.get = function *get() {

  var bikeshed = yield bikesheds.get(this.params.bikeshedId);
  if (bikeshed) {
    this.body = bikeshed;
  } else {
    this.status = 404;
    this.body = {error: 'Bikeshed not found'};
  }
};

exports.rate = function *rate() {

  var r = this.rethinkdb,
    parts = parse(this, {
      autoFields: true,
      limits: {
        files: 1,
        fileSize: 1
      }
    }),
    part;

  while((part = yield parts)) {
    part.resume();
  }

  this.req.field = parts.field || {};

  var action;
  if (this.method === 'PUT') {
    action = 'add';
  } else {
    action = 'sub';
  }

  var update = {
    totalVotes: r.row('totalVotes')[action](1)
  };
  update[this.req.field.file] = {};
  update[this.req.field.file].score = r.row(this.req.field.file)('score')[action](1);

  var result = yield r.table('bikesheds').get(this.params.bikeshedId)
  .update(update, {
    returnVals: true
  }).run();

  this.body = result.new_val;

};
