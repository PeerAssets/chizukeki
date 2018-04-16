### compile time options
For web, edit `web/config/webpack.prod.js`.
For native, `transform-define` options in `.babelrc`
* `KEY_GENERATOR=singleton` will generate normal private keys instead of HD keys 
* `PUBLIC_PATH=/chizukeki` will route requests to the given path

