# ember-cli-deploy-archive [![Build Status](https://travis-ci.org/elidupuis/ember-cli-deploy-archive.svg?branch=master)](https://travis-ci.org/elidupuis/ember-cli-deploy-archive)

> Ember CLI Deploy plugin to create an archive of your deployment build.

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-build.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

This plugin will create a tarball (`.tar.gz`) of your build directory and add it to the deployment context.

## What is an ember-cli-deploy plugin?

A plugin is an addon that can be executed as a part of the ember-cli-deploy pipeline. A plugin will implement one or more of the ember-cli-deploy's pipeline hooks.

For more information on what plugins are and how they work, please refer to the [Plugin Documentation][1].

## Quick Start
To get up and running quickly, do the following:

- Ensure [ember-cli-deploy-build][2] is installed and configured.

- Install this plugin

```bash
$ ember install ember-cli-deploy-archive
```

- Run the pipeline

```bash
$ ember deploy
```

## ember-cli-deploy Hooks Implemented

For detailed information on what plugin hooks are and how they work, please refer to the [Plugin Documentation][1].

- `configure`
- `didBuild`

## Configuration Options

For detailed information on how configuration of plugins works, please refer to the [Plugin Documentation][1].

### Defaults

- Place the following configuration into `config/deploy.js`

```javascript
ENV.archive = {
  archivePath: 'tmp/deploy-archive',
  archiveName: 'build.tar'
}
```

### archivePath

The path to the directory you'd like the project to be archived in.

*Default:* `tmp/deploy-archive`

### archiveName

The name of the archive to be created. Currently only `.tar` is supported (will be gzipped as well).

*Default:* `build.tar`

## Prerequisites

The following properties are expected to be present on the deployment `context` object:

- `distDir` (provided by [ember-cli-deploy-build][2])

## Running Tests

- `npm test`


## Acknowledgements

Big kudos to the Ember CLI Deploy core team and community for 
standardizing deployments and making a dead simple pipeline :ok_hand:

[1]: http://ember-cli.github.io/ember-cli-deploy/plugins "Plugin Documentation"
[2]: https://github.com/ember-cli-deploy/ember-cli-deploy-build "ember-cli-deploy-build"
