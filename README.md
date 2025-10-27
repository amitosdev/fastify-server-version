# Fastify Server Version

A Fastify plugin to add server version and last commit to respose header

## Install

```bash
> npm install --save fastify-server-version
```

## Usage

```javascript
import Fastify from 'fastify'
import { serverVersion } from 'fastify-server-version'

const fastify = Fastify()

fastify.register(serverVersion())

fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
  // Response headers[x-server-version] = 8.8.8
  // Response headers[x-commit-hash] = abc7878
  // Response headers[access-control-expose-headers] = x-commit-hash, x-server-version
})

```

### CORS Support

By default, the plugin automatically adds the `Access-Control-Expose-Headers` header to make the custom headers accessible in CORS requests. The plugin will merge its headers with any existing `Access-Control-Expose-Headers` you've set:

```javascript
fastify.register(serverVersion())

fastify.get('/', (request, reply) => {
  reply.header('Access-Control-Expose-Headers', 'X-Custom-Header')
  reply.send({ hello: 'world' })
  // Response headers[access-control-expose-headers] = x-commit-hash, x-server-version, X-Custom-Header
})
```

If you prefer to manage `Access-Control-Expose-Headers` yourself, you can disable this behavior:

```javascript
fastify.register(serverVersion({ isAddAccessControlExposeHeaders: false }))

fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
  // Response headers[x-server-version] = 8.8.8
  // Response headers[x-commit-hash] = abc7878
  // No Access-Control-Expose-Headers added by the plugin
})
```

## API

### `serverVersion([, pluginOpts])`

* `versionHeaderName` (String) = version header name. Default: `x-server-version`
* `commitHeaderName` (String) = last commit hash header name. Default: `x-commit-hash`
* `isExposeLastCommit` (Boolean) = send last commit hash header in response. Default: `true`
* `isExposeVersion` (Boolean) = send server version header in response. Default: `true`
* `isAddAccessControlExposeHeaders` (Boolean) = add `Access-Control-Expose-Headers` header with plugin headers. When enabled, the plugin will automatically add the `Access-Control-Expose-Headers` header and merge it with any existing values set by the user. This is useful for CORS requests where custom headers need to be exposed to the client. Default: `true`
* `lastCommitHash` (String) = last commit hash. Default: will be taken from environment variable `LAST_COMMIT_HASH`, if not found will be taken from `git`
* `version` (String) = server version. Default: will be taken from package.json file in the current working directory.
* `isThrowOnErrors` (Boolean) = throw error on strat if module fail while trying to guess version and hash. Default: `false`
