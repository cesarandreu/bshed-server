'use strict';

var fs = require('fs'),
  path = require('path'),
  files = [];

exports.initialize = function(database) {

  var f = fs.readdirSync(__dirname);
  for (var i = f.length - 1; i >= 0; i--) {
    if (f[i].indexOf('index') === -1) {
      files.push(path.join(__dirname, f[i]));
      require(path.join(__dirname, f[i])).initialize(database);
    }
  }

};
