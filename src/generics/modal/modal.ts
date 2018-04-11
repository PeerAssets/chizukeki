// https://github.com/Microsoft/TypeScript/issues/10939#issuecomment-363593140
import { Platform } from 'react-native'
import Native from './modal.native'
import Web from './modal.web'

let Modal: typeof Native | typeof Web  

if(Platform.OS === 'web'){
  Modal = Web
} else {
  Modal = Native
}

export default Modal
