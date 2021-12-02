# Fastify Server Version [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A Fastify plugin to add server version and last commit to respose header

## Install

```bash
> npm install --save fastify-server-version
```

## Usage

```javascript
const Fastify = require('fastify')
const serverVersion = require('fastify-server-version')

const fastify = Fastify()

fastify.register(serverVersion())

fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
  // Response headers[x-server-version] = 8.8.8
  // Response headers[x-commit-hash] = abc7878dvee0920ijdksdks
})

```

## API

### `serverVersion([, pluginOpts])`

* `versionHeaderName` (String) = version header name. Default: `x-server-version`
* `commitHeaderName` (String) = last commit hash header name. Default: `x-commit-hash`
* `isExposeLastCommit` (Boolean) = send last commit hash header in response. Default: `true`
* `isExposeVersion` (Boolean) = send server version header in response. Default: `true`
* `lastCommitHash` (String) = last commit hash. Default: will be taken from environment variable `LAST_COMMIT_HASH`, if not found will be taken from `git`
* `version` (String) = server version. Default: will be taken from package.json file in the current working directory.
* `isThrowOnErrors` (Boolean) = throw error on strat if module fail while trying to guess version and hash. Default: `false`
