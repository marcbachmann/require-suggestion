# require-suggestion

Monkey patches require to show suggestions for requires that throw an error


## Usage

```javascript
require('require-suggestion/register')

require('./pakage.json')
```

throws that error instead of the default one

```bash
Error: Cannot find module './pakage.json'

Require suggestions:
- ./package.json
- ./package-lock.json
- ./index.js
- ./register.js

Require stack:
- /app/require-suggestion/test.js
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:933:15)
    at Function.wrappedResolveFilename [as _resolveFilename] (/app/require-suggestion/index.js:60:30)
    at Function.Module._load (node:internal/modules/cjs/loader:778:27)
    at Module.require (node:internal/modules/cjs/loader:1005:19)
    at require (node:internal/modules/cjs/helpers:102:18)
    at Object.<anonymous> (/app/require-suggestion/test.js:7:3)
    at Module._compile (node:internal/modules/cjs/loader:1101:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
    at node:internal/main/run_main_module:17:47
```
