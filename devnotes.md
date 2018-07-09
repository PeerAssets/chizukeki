### compile time options
For web, edit `web/config/webpack.prod.js`.
For native, `transform-define` options in `.babelrc`
* `KEY_GENERATOR=SINGLETON|HD` default `HD` to select private key generator
* `PUBLIC_PATH=/chizukeki` default `/` will route requests to the given path
* `VALID_ISSUE_MODES=ONCE,MULTI,...` filters the available issue mode options
