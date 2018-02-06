import { Platform } from 'react-native'
import NativePackage, * as Native from './router.native'
import WebPackage, * as Web from './router.web'

/*
  Couldn't solve this at the build level
  * typescript extensions inflexibile (https://github.com/Microsoft/TypeScript/issues/10939)
  * including .web.tsx? in webpack extensions has no effect
  * webpack.NormalModuleReplacementPlugin redirects the request, but still has no effect

  we're basically using this trick to preserve some degree of typing
  http://ideasintosoftware.com/typescript-conditional-imports/
*/

let routerExports: typeof Native | typeof Web  
let wholePackage: typeof NativePackage | typeof WebPackage

if(Platform.OS === 'web'){
  routerExports = Web
  wholePackage = WebPackage
} else {
  routerExports = Native
  wholePackage = NativePackage
}

export const { Route, Router, Redirect, Link } = routerExports

export default wholePackage