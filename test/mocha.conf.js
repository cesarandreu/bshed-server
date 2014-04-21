'use strict';
var supertest = require('supertest'),
  co = require('co');

var config = require('../config'),
  rethinkdbSeed = require('../config/rethinkdb-seed'),
  app = require('../'),
  baseUrl = 'http://localhost:' + config.port + '/api',
  request = supertest(baseUrl);

exports.request = request;

console.log('Mocha starting to run server tests on port ' + config.port);
beforeEach(function(done) {
  co(function *() {
    yield rethinkdbSeed(true);
    app.init(done);
  })();
});

afterEach(function(done) {
  app.server.close(done);
});
