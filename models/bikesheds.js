'use strict';

// A model can throw ModelNotFound errors, Validation errors,

var r;
var TABLE = 'bikesheds';
var _ = require('lodash');

exports.TABLE = TABLE;

exports.initialize = function initialize(db) {
  r = db;
};

exports.get = function *get(id) {
  return yield r.table(TABLE).get(id).run();
};

exports.create = function *create(field, files) {
  var e;

  if (files.length < 2) {
    e = new Error('at least two files required');
    e.expose = true;
    throw e;
  }

  var bikeshed = {
    id: field.id,
    time: _.now(),
    name: field.name || '',
    description: field.description || '',
    hidden: (field.hidden === 'true') || false,
    limit: _.parseInt(field.limit) || 60,
    totalVotes: 0
  };

  for (var i = files.length - 1; i >= 0; i--) {
    bikeshed[(i + 1)] = {
      score: 0,
      fieldname: files[i].fieldname,
      filename: files[i].filename,
      fileId: files[i].fileId,
      path: files[i].path
    };
  }

  return yield r.table('bikesheds').insert(bikeshed, {returnVals: true}).run();

};
