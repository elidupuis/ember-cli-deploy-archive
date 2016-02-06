/*jshint globalstrict: true*/
'use strict';

// var RSVP = require('ember-cli/lib/ext/promise');
var assert  = require('ember-cli/tests/helpers/assert');

describe('archive plugin', function() {
  var subject;
  var mockUi;
  var context;

  before(function() {
    subject = require('../../index');
  });

  beforeEach(function() {
    mockUi = {
      verbose: true,
      messages: [],
      write: function() {},
      writeLine: function(message) {
        this.messages.push(message);
      }
    };

    context = {
      distDir: process.cwd() + '/tests/fixtures/dist',
      ui: mockUi,
      config: {
        archive: {
          archivePath: process.cwd() + '/tmp/deploy-archive',
          archiveName: 'build.tar'
        }
      }
    }
  });

  it('has a name', function() {
    var plugin = subject.createDeployPlugin({
      name: 'archive'
    });

    assert.equal(plugin.name, 'archive');
  });

  it('implements the correct hooks', function() {
    var plugin = subject.createDeployPlugin({
      name: 'archive'
    });

    assert.equal(typeof plugin.configure, 'function');
    assert.equal(typeof plugin.didBuild, 'function');
  });

  describe('configure hook', function() {
    it('adds default config to the config object', function() {
      delete context.config.archive.archivePath;
      delete context.config.archive.archiveName;

      assert.isUndefined(context.config.archive.archivePath);
      assert.isUndefined(context.config.archive.archiveName);

      var plugin = subject.createDeployPlugin({
        name: 'archive'
      });
      plugin.beforeHook(context);
      plugin.configure(context);

      assert.isDefined(context.config.archive.archivePath);
      assert.isDefined(context.config.archive.archiveName);
    });
  });

  describe.skip('#didBuild hook', function() {
    it('prints the begin message', function() {
      var plugin = subject.createDeployPlugin({
        name: 'archive'
      });

      plugin.beforeHook(context);
      return assert.isFulfilled(plugin.didBuild(context))
        .then(function() {
          assert.ok(true);
          // assert.equal(mockUi.messages.length, 2);
          // console.log('messages', mockUi.messages[0]), mockUi.messages[1]
          // assert.match(mockUi.messages[0], /saving tarball of /);
        });
    });
  });

});
