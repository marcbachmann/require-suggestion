var path = require('path')
var glob = require('glob')
var Module = require('module')
var levenshtein =  require('fast-levenshtein')

module.exports = wrapRequiresWithSuggests

function wrapRequiresWithSuggests () {
  var baseDir = path.resolve.apply(null, Array.from(arguments).filter(Boolean))
  var extensions  = Object.keys(require.extensions).join('|').replace(/\./g, '\\.')

  var globOpts = {cwd: baseDir, nodir: true, nosort: true, ignore: 'node_modules/**/*'}
  var originalPaths = glob.sync(`**/*@(${extensions})`, globOpts)
  var paths = originalPaths.map(function (p) {
    return removeExt(p).replace(new RegExp('^'+baseDir), '')
  })

  function suggest (filename) {
    filename = removeExt(path.relative(baseDir, filename))
    return paths
      .map(function (p, index) {
        distance = levenshtein.get(p, filename)
        return {
          path: p,
          index: index,
          distance: distance,
          thereshold: distance / p.length
        }
      })
      .sort(function (a, b) { return a.distance - b.distance })
      .filter(function (p) {
        console.log(p.path, p.distance, p.thereshold)
        if (!p.path) return false
        if (p.thereshold < 0.8) return true
      })
      .slice(0, 6)
      .map(function (p) {
        return path.join(baseDir, originalPaths[p.index])
      })
  }

  var originalResolve = Module._resolveFilename
  Module._resolveFilename = function wrappedResolveFilename (request, parent) {
    try {
      return originalResolve.call(this, request, parent)
    } catch (err) {
      if (/^[^\.]/.test(request)) throw err

      var resolved = path.relative(parent.filename, request)
      var suggestions = suggest(resolved)
      if (!suggestions.length) throw err

      function toRelative (p) {
        var dir = path.relative(parent.filename, p)
        if (/^..\/[^\.]/.test(dir))
          return dir.replace('../', './')
        else
          return dir.replace('../', '')
      }

      var files = suggestions.map(toRelative)
      var stack = err.stack.split('\n')
      var firstLine = stack.shift()
      stack.unshift(
        firstLine,
        "\nProbably you wanted to require one of those:\n",
        `  ${files.join('\n  ')}\n`,
        "You tried to require it in that file:\n",
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
