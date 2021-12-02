const fp = require('fastify-plugin')
const { exec } = require('child_process')
const path = require('path')
const { readFile } = require('fs')
const debug = require('debug')('fastify-server-version')

function getlastCommitHash (optsLastCommitHash, isThrowOnErrors, cb) {
  if (optsLastCommitHash) return cb(null, optsLastCommitHash)
  if (process.env.LAST_COMMIT_HASH) return cb(null, process.env.LAST_COMMIT_HASH)
  exec('git rev-parse HEAD', (err, stdout) => {
    if (err) {
      debug('error in getlastCommitHash from git: ', err)
      return cb(isThrowOnErrors ? err : null)
    }
    cb(null, stdout.toString().trim())
  })
}

function getVersion (optsVersion, isThrowOnErrors, cb) {
  if (optsVersion) return cb(null, optsVersion)
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  readFile(packageJsonPath, 'utf-8', (err, file) => {
    if (err) {
      debug('error in getVersion: ', err)
      return cb(isThrowOnErrors ? err : null)
    }
    try {
      const { version } = JSON.parse(file)
      cb(null, version)
    } catch (e) {
      debug('error in getVersion: ', e)
      cb(isThrowOnErrors ? e : null)
    }
  })
}

module.exports = ({
  versionHeaderName = 'x-server-version',
  commitHeaderName = 'x-commit-hash',
  isExposeLastCommit = true,
  isExposeVersion = true,
  lastCommitHash,
  version,
  isThrowOnErrors = false
} = {}) => {
  function plugin (instance, options, done) {
    getlastCommitHash(lastCommitHash, isThrowOnErrors, (err, lastCommit) => {
      if (err) return done(err)
      getVersion(version, isThrowOnErrors, (err, serverVersion) => {
        if (err) return done(err)

        if (isExposeLastCommit && lastCommit) {
          instance.addHook('onSend', (request, reply, payload, next) => {
            reply.header(commitHeaderName, lastCommit)
            next()
          })
        }

        if (isExposeVersion && serverVersion) {
          instance.addHook('onSend', (request, reply, payload, next) => {
            reply.header(versionHeaderName, serverVersion)
            next()
          })
        }

        done()
      })
    })
  }
  return fp(plugin, {
    fastify: '>= 3',
    name: 'server-version'
  })
}
