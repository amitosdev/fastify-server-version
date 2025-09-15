import { readFile } from 'node:fs/promises'
import path from 'node:path'
import debug from 'debug'
import fp from 'fastify-plugin'
import gitCommitInfo from 'git-commit-info'

const debugLogger = debug('fastify-server-version')

async function getlastCommitHash(optsLastCommitHash) {
  if (optsLastCommitHash) return optsLastCommitHash
  if (process.env.LAST_COMMIT_HASH) return process.env.LAST_COMMIT_HASH
  const { shortCommit } = await gitCommitInfo()
  return shortCommit
}

async function getVersion(optsVersion) {
  if (optsVersion) return optsVersion
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const pkgJson = await readFile(packageJsonPath, 'utf-8')
  const { version } = JSON.parse(pkgJson)
  return version
}

export function serverVersion({
  versionHeaderName = 'x-server-version',
  commitHeaderName = 'x-commit-hash',
  isExposeLastCommit = true,
  isExposeVersion = true,
  lastCommitHash,
  version,
  isThrowOnErrors = false
} = {}) {
  async function plugin(instance, options) {
    try {
      const lastCommit = await getlastCommitHash(lastCommitHash)
      const serverVersion = await getVersion(version)
      if (isExposeLastCommit || isExposeVersion) {
        instance.addHook('onSend', (request, reply, payload, next) => {
          isExposeLastCommit && reply.header(commitHeaderName, lastCommit)
          isExposeVersion && reply.header(versionHeaderName, serverVersion)
          next()
        })
      }
    } catch (err) {
      debugLogger('error in fastify-server-version: ', err)
      if (isThrowOnErrors) throw err
    }
  }
  return fp(plugin, {
    fastify: '>= 3',
    name: 'server-version'
  })
}
