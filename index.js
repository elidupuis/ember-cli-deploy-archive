/* eslint-env node */
'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
var RSVP       = require('rsvp');
var fs         = require('fs-extra');
var path       = require('path');
var move       = RSVP.denodeify(fs.move);
var tar      = require('tar');

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

      willUpload: function(context) {
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
            self.log('tarball ok');
          })
          .catch(function(err){
            throw new Error(err.stack);
          });
      },

      // create tarball
      _pack: function(dir) {
        var archivePath = this.readConfig('archivePath');
        var archiveName = this.readConfig('archiveName');
        var containingDirectory = path.dirname(dir);
        var target = path.basename(dir);

        var fileName = path.join(archivePath, archiveName);

        this.log('saving tarball of ' + dir + ' to ' + fileName);

        return tar.c({
          gzip: true,
          file: fileName,
          C: containingDirectory
        }, [target]);
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

        return RSVP.resolve();
      },

      _cleanup: function() {
        var distDir = this.readConfig('distDir');

        // revert distDir to original location if `packedDirName` was set
        if (this.distDir !== distDir) {
          this.log('moving ' + this.distDir + ' to ' + distDir, { verbose: true });
          return move(this.distDir, distDir);
        }

        return RSVP.resolve();
      }
    });

    return new DeployPlugin();
  }
};
