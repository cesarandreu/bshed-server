'use strict';

var config = {
  host: 'localhost',
  port: 28015,
  db: 'bshed'
};

var koa = require('koa'),
    uuid = require('node-uuid'),
    logger = require('koa-logger'),
    json = require('koa-json'),
    bshed = require('./lib/routes'),
    mount = require('koa-mount'),
    serve = require('koa-static'),
    rethinkdb = require('rethinkdbdash')(config),
    models = require('./lib/models'),
    app = koa();

// Initialize all models with the database
models.initialize(rethinkdb);

if (app.env === 'development') {
  app.use(logger());
  app.use(json());
}

// Handle invalid forms
app.use(function *(next) {
  if (['PUT', 'DELETE', 'POST'].indexOf(this.method) !== -1 && !this.request.is('multipart/*')) {
    this.status = 400;
    this.body = { error: 'Forms must be multipart/form-data' };
  } else {
    yield next;
  }
});

app.use(function *(next) {
  this.id = uuid.v1();
  this.rethinkdb = rethinkdb;
  yield next;
});



app.use(mount('/api', bshed()));

app.use(mount('/public', serve('./public')));

app.listen(3000);
