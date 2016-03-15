# require-suggestion

Monkey patches require to show suggestions for requires that throw an error


## Usage

```javascript
require('require-suggestion/register')

require('./pakage.json')
```

throws that error instead of the default one

```bash
Error: Cannot find module './pakage'

Probably you wanted to require one of those:

  ./package.json
  ./register.js
  ./test.js
  ./index.js

You tried to require it in that file:

  /your/exection/script/path/index.js

    at Function.Module._resolveFilename (module.js:337:15)
    at Function.wrappedResolveFilename [as _resolveFilename] (/Users/marcbachmann/Development/marcbachmann/require-suggestion/index.js:40:30)
    at Function.Module._load (module.js:287:25)
    at Module.require (module.js:366:17)
    at require (module.js:385:17)
    at repl:1:1
    at REPLServer.defaultEval (repl.js:248:27)
    at bound (domain.js:280:14)
    at REPLServer.runBound [as eval] (domain.js:293:12)
    at REPLServer.<anonymous> (repl.js:412:12)
```
