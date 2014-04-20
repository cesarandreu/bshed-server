'use strict';
var Router = require('koa-router'),
    bikesheds = require('./controllers/bikesheds'),
    upload = require('./middleware/upload'),
    bshed = new Router();

module.exports = function routes() {

  bshed
    .get('/bikesheds', bikesheds.list)
    .post('/bikesheds', upload.files, bikesheds.create)
    .get('/bikesheds/:bikeshedId', bikesheds.get)
    .put('/bikesheds/:bikeshedId/vote', upload.form, bikesheds.rate)
    .del('/bikesheds/:bikeshedId/vote', upload.form, bikesheds.rate);

  return bshed.middleware();
};
