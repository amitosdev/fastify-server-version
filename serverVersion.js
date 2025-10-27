import { readFile } from 'node:fs/promises'
import path from 'node:path'
import debug from 'debug'
import fp from 'fastify-plugin'
import { getGitLastCommitHash } from 'git-last-commit-hash'

const debugLogger = debug('fastify-server-version')

async function getlastCommitHash(optsLastCommitHash) {
  if (optsLastCommitHash) return optsLastCommitHash
  if (process.env.LAST_COMMIT_HASH) return process.env.LAST_COMMIT_HASH
  const lastCommit = await getGitLastCommitHash()
  return lastCommit.slice(0, 7)
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
  isAddAccessControlExposeHeaders = true,
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
          if (isExposeLastCommit) {
            reply.header(commitHeaderName, lastCommit)
          }
          if (isExposeVersion) {
            reply.header(versionHeaderName, serverVersion)
          }

          if (isAddAccessControlExposeHeaders) {
            const accessControlExposeHeaders = []
            if (isExposeLastCommit) {
              accessControlExposeHeaders.push(commitHeaderName)
            }
            if (isExposeVersion) {
              accessControlExposeHeaders.push(versionHeaderName)
            }

            // Merge with existing Access-Control-Expose-Headers if present
            const existing = reply.getHeader('Access-Control-Expose-Headers')
            if (existing) {
              const existingHeaders = typeof existing === 'string' ? existing.split(',').map((h) => h.trim()) : []
              accessControlExposeHeaders.push(...existingHeaders)
            }

            reply.header('Access-Control-Expose-Headers', accessControlExposeHeaders.join(', '))
          }
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
