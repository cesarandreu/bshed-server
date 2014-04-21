'use strict';

/**
 * Dependencies
 */
var mochaConf = require('./mocha.conf'),
  request = mochaConf.request;

describe('Application', function(){
  describe('GET /bikesheds', function(){
    it('should respond with LIST', function(done){
      request
      .get('/bikesheds')
      .expect(200)
      // .expect('Content-Type', /json/)
      .expect(/LIST/, done);
    });
  });
});
