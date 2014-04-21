'use strict';

/**
 * Dependencies
 */
var mochaConf = require('./mocha.conf'),
  request = mochaConf.request;

require('should');

describe('Bikesheds: Create', function(){
  describe('Valid request', function() {

    it('should allow you to set parameters', function(done) {
      var bikeshed = {
        name: 'My bikeshed!',
        description: 'This is my bikeshed',
        hidden: true,
        limit: 30,
        file1: 'pic1.jpg',
        file2: 'pic2.jpg'
      };

      request
      .post('/bikesheds')
      .field('name', bikeshed.name)
      .field('description', bikeshed.description)
      .field('hidden', bikeshed.hidden)
      .field('limit', bikeshed.limit)
      .attach('pic1', 'test/fixtures/pic1.jpg', bikeshed.file1)
      .attach('pic2', 'test/fixtures/pic2.jpg', bikeshed.file2)
      .expect(function(res) {
        res.status.should.equal(200);
        res.body.name.should.equal(bikeshed.name);
        res.body.description.should.equal(bikeshed.description);
        res.body.hidden.should.equal(true);
        res.body.limit.should.equal(bikeshed.limit);
        res.body[1].filename.should.equal(bikeshed.file1);
        res.body[2].filename.should.equal(bikeshed.file2);
      })
      .end(done);
    });

    it('should provide default values', function(done) {
      var bikeshed = {
        file1: 'pic1.jpg',
        file2: 'pic2.jpg'
      };

      request
      .post('/bikesheds')
      .attach('pic1', 'test/fixtures/pic1.jpg', bikeshed.file1)
      .attach('pic2', 'test/fixtures/pic2.jpg', bikeshed.file2)
      .expect(function(res) {
        res.should.have.status(200);
        res.body.name.should.have.length(0);
        res.body.description.should.have.length(0);
        res.body.hidden.should.equal(false);
        res.body.limit.should.equal(60);
        res.body.totalVotes.shold.equal(0);
        res.body[1].filename.should.equal(bikeshed.file1);
        res.body[1].score.should.equal(0);
        res.body[2].filename.should.equal(bikeshed.file2);
        res.body[2].score.should.equal(0);
      })
      .end(done);
    });

  });

  describe('Invalid request', function() {
    it('should fail when less than two files are sent', function(done) {
      var bikeshed = {
        file1: 'pic1.jpg',
      };

      request
      .post('/bikesheds')
      .attach('pic1', 'test/fixtures/pic1.jpg', bikeshed.file1)
      .expect(422, 'at least two files required')
      .end(done);

      request
      .post('/bikesheds')
      .expect(422, 'at least two files required')
      .end(done);
    });

  });


});
