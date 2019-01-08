const path = require('path')
const Module = require('module')

module.exports = wrapRequiresWithSuggests

function wrapRequiresWithSuggests () {
  const baseDir = path.resolve.apply(null, Array.from(arguments).filter(Boolean))
  const extensions = Object.keys(require.extensions).join('|').replace(/\./g, '\\.')

  let _originalPaths
  let _relativePaths

  function getPaths () {
    if (_originalPaths) return {originalPaths: _originalPaths, relativePaths: _relativePaths}

    const glob = require('glob')
    _originalPaths = glob.sync(`**/*@(${extensions})`, {
      cwd: baseDir,
      nodir: true,
      nosort: true,
      ignore: 'node_modules/**/*'
    })

    _relativePaths = _originalPaths.map(function (p) {
      return removeExt(p).replace(new RegExp(`^${baseDir}`), '')
    })

    return {originalPaths: _originalPaths, relativePaths: _relativePaths}
  }

  function suggest (filename) {
    const levenshtein = require('js-levenshtein')

    const {originalPaths, relativePaths} = getPaths()

    filename = removeExt(path.relative(baseDir, filename))
    return relativePaths
      .map(function (p, index) {
        const distance = levenshtein(p, filename)
        return {
          path: p,
          index: index,
          distance: distance,
          thereshold: distance / p.length
        }
      })
      .sort(function (a, b) { return a.distance - b.distance })
      .filter(Boolean)
      .slice(0, 6)
      .map(function (p) {
        return path.join(baseDir, originalPaths[p.index])
      })
  }

  const originalResolve = Module._resolveFilename
  Module._resolveFilename = function wrappedResolveFilename (request, parent) {
    function toRelative (p) {
      const dir = path.relative(parent.filename, p)
      if (/^..\/[^.]/.test(dir)) return dir.replace('../', './')
      else return dir.replace('../', '')
    }

    try {
      return originalResolve.call(this, request, parent)
    } catch (err) {
      if (/^[^.]/.test(request)) throw err

      const resolved = path.relative(parent.filename, request)
      const suggestions = suggest(resolved)
      if (!suggestions.length) throw err

      const files = suggestions.map(toRelative)
      const stack = err.stack.split('\n')
      const firstLine = stack.shift()
      stack.unshift(
        firstLine,
        '\nProbably you wanted to require one of those:\n',
        `  ${files.join('\n  ')}\n`,
        'You tried to require it in that file:\n',
        `  ${parent.filename}\n`
      )
      err.stack = stack.join('\n')
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
