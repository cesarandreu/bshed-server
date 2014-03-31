'use strict';

var koa = require('koa'),
    logger = require('koa-logger'),
    router = require('koa-router'),
    parse = require('co-busboy'),
    app = koa();

app.use(logger());
app.use(router(app));

app
  .get('/', function *() {
    console.log('HEADERS:', this.request.header);
    console.log('TYPE:', this.request.type);
    this.body = 'GET FINISHED!';
  })
  .post('/', function *() {

    var parts = parse(this);
    var part;

    console.log('HEADERS:', this.request.header);
    console.log('TYPE:', this.request.type);

    // It gets stuck here
    while ((part = yield parts)) {
      // This is never called
      console.log('PART:', part);
    }

    console.log('parts.field', parts.field);

    this.body = 'POST FINISHED!';
  });

app.listen(9000);
