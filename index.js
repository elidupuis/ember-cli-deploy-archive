/* jshint node: true */
'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
var Promise    = require('ember-cli/lib/ext/promise');
var fs         = require('fs-extra');
var path       = require('path');
var copy       = Promise.denodeify(fs.copy);
var remove     = Promise.denodeify(fs.remove);
var targz      = require('tar.gz');

module.exports = {
  name: 'ember-cli-deploy-archive',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        archivePath: path.join('tmp', 'deploy-archive'),
        archiveName: 'build.tar',
        distDir: function(context) {
          return context.distDir;
        },
        packedDirName: false
      },

      setup: function(/* context */) {
        this.log('setting `archivePath` and `archiveName` in deployment context', { verbose: true });

        return {
          archivePath: this.readConfig('archivePath'),
          archiveName: this.readConfig('archiveName')
        };
      },

      didBuild: function(context) {
        var self = this;
        var archivePath = this.readConfig('archivePath');
        this.distDir    = this.readConfig('distDir');

        // ensure our `archivePath` directory is avaiable
        fs.mkdirsSync(archivePath);

        return this._moveDistDir(context)
          .then(function() {
            return self._pack(self.distDir);
          })
          .then(function() {
            self._cleanup(context);
          })
          .then(function(){
            self.log('tarball ok', { verbose: true });
          })
          .catch(function(err){
            throw new Error(err.stack);
          });
      },

      // create tarball
      _pack: function(dir) {
        var archivePath = this.readConfig('archivePath');
        var archiveName = this.readConfig('archiveName');
        var fileName = path.join(archivePath, archiveName);

        this.log('saving tarball of ' + dir + ' to ' + fileName, { verbose: true });

        var targzOptions = this.readConfig('targzOptions');
        if (targzOptions) {
          return targz({},targzOptions).compress(dir, fileName);
        } else {
          return targz().compress(dir, fileName);
        }
      },

      // to allow configurable naming of the directory inside the tarball
      _moveDistDir: function() {
        var distDir = this.readConfig('distDir');
        var packedDirName = this.readConfig('packedDirName');
        var archivePath = this.readConfig('archivePath');

        if (packedDirName) {
          packedDirName = path.join(archivePath, packedDirName);
          this.log('copying ' + distDir + ' to ' + packedDirName, { verbose: true });

          this.distDir = packedDirName;
          return copy(distDir, packedDirName);
        }

        return Promise.resolve();
      },

      _cleanup: function() {
        var distDir = this.readConfig('distDir');

        // revert distDir to original location if `packedDirName` was set
        if (this.distDir !== distDir) {
          this.log('cleaning up ' + this.distDir, { verbose: true });
          return remove(this.distDir);
        }

        return Promise.resolve();
      }
    });

    return new DeployPlugin();
  }
};
