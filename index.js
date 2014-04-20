'use strict';

var koa = require('koa'),
    logger = require('koa-logger'),
    json = require('koa-json'),
    mount = require('koa-mount'),
    serve = require('koa-static'),
    uuid = require('node-uuid'),

    app = koa(),
    config = require('./config'),
    routes = require('./routes'),
    models = require('./models'),
    rethinkdb = require('rethinkdbdash')(config.database);

app.env = config.environment;
app.config = config;

// Initialize all models with the database instance
models.initialize(rethinkdb);

if (config.environment === 'development') {
  app.use(logger());
  app.use(json());
}

// Handle invalid forms
app.use(require('./middleware/upload').safe);

// Assigns the request a unique id, assigns the database instance
app.use(function *(next) {
  this.id = uuid.v1();
  this.rethinkdb = rethinkdb;
  yield next;
});

app.use(mount('/api', routes()));
app.use(mount('/public', serve(config.upload.folder)));

app.listen(config.port);
