'use strict';

var _ = require('lodash'),
  path = require('path');
var options = {

  root: path.resolve(module.filename, '../..'),

  upload: {
    /**
     * Required: Public folder's location relative to the root
     */
    folder: './public',

    /**
     * Required: Filesize limit for file uploads
     */
    fileSizeLimit: 5000000,

    /**
     * Required: File limit for uploads
     */
    filesLimit: 10

  },

  /**
   * Cookie keys
   */
  cookies: {
    keys: ['something to sign cookies']
  },

  /**
   * Port to start the server on
   */
  port: process.env.PORT || 3000,

  /**
   * Application environment
   */
  environment: process.env.NODE_ENV || 'development'
};

module.exports = _.merge(options, require('./environments/' + options.environment));
