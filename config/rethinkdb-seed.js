'use strict';

var config = require('./index'),
  rethinkdb = require('rethinkdbdash')(config.database);

module.exports = function *(overwrite) {
  var cursor = yield rethinkdb.dbList().run(),
    list = yield cursor.toArray();

  if (list.indexOf(config.database.db) > -1 && overwrite) {
    yield rethinkdb.dbDrop(config.database.db).run();
    yield rethinkdb.dbCreate(config.database.db).run();

    // TODO: Make tables smarter
    yield rethinkdb.tableCreate('bikesheds').run();
  } else if (list.indexOf(config.database.db) === -1) {
    yield rethinkdb.dbCreate(config.database.db).run();

    // TODO: Make tables smarter
    yield rethinkdb.tableCreate('bikesheds').run();
  }

};
