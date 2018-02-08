// https://github.com/Microsoft/TypeScript/issues/10939#issuecomment-363593140
import { Platform } from 'react-native'
import NativePackage, * as Native from './router.native'
import WebPackage, * as Web from './router.web'

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
