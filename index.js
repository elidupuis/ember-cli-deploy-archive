/* jshint node: true */
'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
var Promise    = require('ember-cli/lib/ext/promise');
var fs         = require('fs-extra');
var path       = require('path');
var move       = Promise.denodeify(fs.move);
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

      didBuild: function(context) {
        var self = this;
        var archivePath = this.readConfig('archivePath');
        var archiveName = this.readConfig('archiveName');
        this.distDir    = this.readConfig('distDir');

        // ensure our `archivePath` directory is avaiable
        fs.mkdirsSync(archivePath);

        return this._moveDistDir(context)
          .then(function() {
            return self._pack(self.distDir);
          })
          .then(function(){
            self.log('tarball ok');

            return {
              archiveDir: archivePath,
              archiveName: archiveName
            };
          })
          .then(function() {
            self._cleanup(context);
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

        this.log('saving tarball of ' + dir + ' to ' + fileName);

        return targz().compress(dir, fileName);
      },

      // to allow configurable naming of the directory inside the tarball
      _moveDistDir: function() {
        var distDir = this.readConfig('distDir');
        var packedDirName = this.readConfig('packedDirName');
        var archivePath = this.readConfig('archivePath');

        if (packedDirName) {
          packedDirName = path.join(archivePath, packedDirName);
          this.log('moving ' + distDir + ' to ' + packedDirName);

          this.distDir = packedDirName;
          return move(distDir, packedDirName);
        }

        return Promise.resolve();
      },

      _cleanup: function() {
        var distDir = this.readConfig('distDir');

        // revert distDir to original location if `packedDirName` was set
        if (this.distDir !== distDir) {
          this.log('moving ' + this.distDir + ' to ' + distDir, { verbose: true });
          return move(this.distDir, distDir);
        }

        return Promise.resolve();
      }
    });

    return new DeployPlugin();
  }
};
