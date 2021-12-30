const assert = require('assert')
require('./index')(__dirname)

assert.doesNotThrow(function () { require('./package') })

try {
  require('./ackage')
} catch (err) {
  if (!/Error: Cannot find module '\.\/ackage'/.test(err.stack)) {
    throw new Error('Stack does not begin with default error message')
  }

  if (!/Require suggestions:/.test(err.stack)) {
    throw new Error('Stack does not contain suggestion sentence')
  }

  if (!/Require suggestions:\n- \.\/package.json/.test(err.message)) {
    throw new Error('Stack does not show package.json suggestion')
  }
}
