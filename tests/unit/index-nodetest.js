/*jshint globalstrict: true*/
'use strict';

var Promise = require('ember-cli/lib/ext/promise');
var assert  = require('./../helpers/assert');
var fs      = require('fs');
var stat    = Promise.denodeify(fs.stat);
var path    = require('path');
var targz   = require('tar.gz');

var ARCHIVE_NAME = 'build.tar';
var ARCHIVE_PATH = process.cwd() + '/tmp/deploy-archive';
var DIST_DIR = 'dist';

describe('archive plugin', function() {
  var subject, mockUi, context, plugin;

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

    plugin = subject.createDeployPlugin({
      name: 'archive'
    });

    context = {
      distDir: process.cwd() + '/tests/fixtures/' + DIST_DIR,
      ui: mockUi,
      config: {
        archive: {
          archivePath: ARCHIVE_PATH,
          archiveName: ARCHIVE_NAME
        }
      }
    };
  });

  it('has a name', function() {
    assert.equal(plugin.name, 'archive');
  });

  describe('hooks', function() {
    beforeEach(function() {
      plugin.beforeHook(context);
      plugin.configure(context);
      plugin.setup(context);
    });

    it('implements the correct hooks', function() {
      assert.equal(typeof plugin.configure, 'function');
      assert.equal(typeof plugin.setup, 'function');
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

    describe('setup hook', function() {
      it('adds proper data to the deployment context', function() {
        var result = plugin.setup(context);

        assert.deepEqual(result, {
          archivePath: ARCHIVE_PATH,
          archiveName: ARCHIVE_NAME
        });
      });
    });

    describe('didBuild hook', function() {

      it('creates a tarball of the dist folder', function() {
        this.timeout(10000);
        var archivePath = context.config.archive.archivePath;
        var archiveName = context.config.archive.archiveName;

        return assert.isFulfilled(plugin.didBuild(context))
          .then(function() {
            var fileName = path.join(archivePath, archiveName);

            return stat(fileName).then(function(stats) {
              assert.ok(stats.isFile());
            })
            .then(function() {
              return targz().extract(fileName, archivePath);
            })
            .then(function() {
              var extractedDir = archivePath + '/' + DIST_DIR;

              return stat(extractedDir).then(function(stats) {
                assert.ok(stats.isDirectory());
              });
            });
          });
      });

      it.skip('copies the dist folder in order to rename it, if `packedDirName` is set');
      it.skip('returns the dist folder to it\'s original location, if `packedDirName` is set');

    });
  });
});
