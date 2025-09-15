import Fastify from 'fastify'
import { test } from 'tap'
import { serverVersion } from '../serverVersion.js'

const lch = 'abc123'
const semverRegex = /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?$/
const shortCommitRegex = /^[a-f0-9]{7}$/

function getApp(serverVersionOpts) {
  const fastify = Fastify()

  fastify.register(serverVersion(serverVersionOpts))

  fastify.get('/', (_request, reply) => {
    reply.send({ hello: 'world' })
  })
  return fastify
}

test('with default configuration', (t) => {
  const fastify = getApp()

  fastify.inject(
    {
      method: 'GET',
      url: '/'
    },
    (err, res) => {
      t.error(err)
      t.match(res.headers, { 'x-server-version': semverRegex })
      t.match(res.headers, { 'x-commit-hash': shortCommitRegex })
      t.end()
    }
  )
})

test('with default configuration and commit hash from env', (t) => {
  process.env.LAST_COMMIT_HASH = lch

  const fastify = getApp()

  fastify.inject(
    {
      method: 'GET',
      url: '/'
    },
    (err, res) => {
      t.error(err)
      t.match(res.headers, { 'x-server-version': semverRegex })
      t.match(res.headers, { 'x-commit-hash': lch })
      t.end()
    }
  )
})

test('with default configuration and commit hash and version from opts', (t) => {
  const opts = { lastCommitHash: 'abc', version: '8.8.8' }
  const fastify = getApp(opts)

  fastify.inject(
    {
      method: 'GET',
      url: '/'
    },
    (err, res) => {
      t.error(err)
      t.match(res.headers, { 'x-server-version': opts.version })
      t.match(res.headers, { 'x-commit-hash': opts.lastCommitHash })
      t.end()
    }
  )
})

test('with diffrent headers and commit hash from env', (t) => {
  process.env.LAST_COMMIT_HASH = lch
  const opts = { versionHeaderName: 'x-foo', commitHeaderName: 'x-bar' }
  const fastify = getApp(opts)

  fastify.inject(
    {
      method: 'GET',
      url: '/'
    },
    (err, res) => {
      t.error(err)
      t.match(res.headers, { [opts.versionHeaderName]: semverRegex })
      t.match(res.headers, { [opts.commitHeaderName]: lch })
      t.end()
    }
  )
})

test('dont expose headers', (t) => {
  process.env.LAST_COMMIT_HASH = lch

  const fastify = getApp({ isExposeLastCommit: false, isExposeVersion: false })

  fastify.inject(
    {
      method: 'GET',
      url: '/'
    },
    (err, res) => {
      t.error(err)
      t.notMatch(res.headers, { 'x-server-version': semverRegex })
      t.notMatch(res.headers, { 'x-commit-hash': lch })
      t.end()
    }
  )
})
