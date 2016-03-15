var assert = require('assert')
require('./index')(__dirname)

assert.doesNotThrow(function () { require('./package') })

try {
	require('./ackage')
} catch (err) {
	if (!/Error: Cannot find module '\.\/ackage'/.test(err.stack))
		throw new Error('Stack does not begin with default error message')

	if (!/Probably you wanted to require one of those:/.test(err.stack))
		throw new Error('Stack does not contain suggestion sentence')

	if (!/one of those:\n\n  \.\/package\.json/.test(err.stack))
		throw new Error('Stack does not package.json suggestion')
}
