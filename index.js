'use strict';

var koa = require('koa'),
    logger = require('koa-logger'),
    json = require('koa-json'),
    mount = require('koa-mount'),
    serve = require('koa-static'),
    uuid = require('node-uuid'),
    co = require('co'),

    app = koa(),
    config = require('./config'),
    routes = require('./routes'),
    models = require('./models'),
    rethinkdbdash = require('rethinkdbdash'),
    rethinkdbSeed = require('./config/rethinkdb-seed');

module.exports = app;

app.init = co(function *() {

  // Initialize rethinkdb and models with the database instance
  yield rethinkdbSeed();
  var rethinkdb = rethinkdbdash(config.database);
  models.initialize(rethinkdb);

  app.env = config.environment;
  app.config = config;

  if (config.environment === 'development') {
    app.use(logger());
    app.use(json());
  }

  // Handle invalid forms
  app.use(require('./middleware/upload').safe);

  // Assigns the request a unique id
  // aAssigns the database instance
  app.use(function *(next) {
    this.id = uuid.v1();
    this.rethinkdb = rethinkdb;
    yield next;
  });

  app.use(mount('/api', routes()));
  app.use(mount('/public', serve(config.upload.folder)));

  app.server = app.listen(config.port);
});

if (!module.parent) {
  app.init();
}
