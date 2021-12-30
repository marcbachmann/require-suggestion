const path = require('path')
const Module = require('module')

module.exports = wrapRequiresWithSuggests

function wrapRequiresWithSuggests (...args) {
  const baseDir = path.resolve.apply(null, args.filter(Boolean))
  const baseDirRegex = new RegExp(`^${baseDir}`)
  const extensions = Object.keys(require.extensions || ['.js']).join('|').replace(/\./g, '\\.')

  let _originalPaths
  let _relativePaths

  function getPaths () {
    if (_originalPaths) return {originalPaths: _originalPaths, relativePaths: _relativePaths}

    const glob = require('fast-glob')
    _originalPaths = glob.sync(`**/*@(${extensions})`, {
      cwd: baseDir,
      onlyFiles: true,
      ignore: 'node_modules/**/*'
    })

    _relativePaths = _originalPaths.map(function (p) {
      return removeExt(p).replace(baseDirRegex, '')
    })

    return {originalPaths: _originalPaths, relativePaths: _relativePaths}
  }

  function suggest (filename) {
    const {distance: levelDistance} = require('fastest-levenshtein')

    const {originalPaths, relativePaths} = getPaths()

    filename = removeExt(path.relative(baseDir, filename))
    return relativePaths
      .map(function (p, index) {
        return {
          index: index,
          distance: levelDistance(p, filename)
        }
      })
      .sort(function (a, b) { return a.distance - b.distance })
      .slice(0, 6)
      .map(function (p) {
        return originalPaths[p.index]
      })
  }

  const originalResolve = Module._resolveFilename
  Module._resolveFilename = function wrappedResolveFilename (request, parent, isMain, options) {
    function toRelative (p) {
      const dir = path.relative(parent.filename, p)
      if (/^..\/[^.]/.test(dir)) return dir.replace('../', './')
      else return dir.replace('../', '')
    }

    try {
      return originalResolve.call(this, request, parent, isMain, options)
    } catch (err) {
      if (/^[^.]/.test(request)) throw err

      const resolved = path.relative(parent.filename, request)
      const suggestions = suggest(resolved)
      if (!suggestions.length) throw err

      const files = suggestions.map(toRelative).filter(Boolean)
      err.message = err.message.replace(
        '\n',
        `\n\nRequire suggestions:\n` +
        `- ${files.join('\n- ')}\n\n`
      )
      throw err
    }
  }

  return function restoreRequires () {
    Module._resolveFilename = originalResolve
  }
}

function removeExt (filename) {
  return filename.replace(/(\.[a-z]*)$/, '')
}
