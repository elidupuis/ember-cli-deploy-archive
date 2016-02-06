/* jshint node: true */
'use strict';
var BasePlugin = require('ember-cli-deploy-plugin');
var path       = require('path');
var targz      = require('tar.gz');

module.exports = {
  name: 'ember-cli-deploy-archive',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        archivePath: path.join('tmp', 'deploy-archive'),
        archiveName: 'build.tar'
      },

      didBuild: function(context) {
        var self = this;
        var distDir = context.distDir;
        var archivePath = this.readConfig('archivePath');
        var archiveName = this.readConfig('archiveName');
        var fileName = path.join(archivePath, archiveName);

        this.log('saving tarball of ' + distDir + ' to ' + fileName);

        return targz().compress(distDir, fileName)
          .then(function(){
            self.log('tarball ok');

            return {
              archiveDir: archivePath,
              archiveName: archiveName
            }
          })
          .catch(function(err){
            throw new Error(err.stack);
          });
      }
    });

    return new DeployPlugin();
  }
};
