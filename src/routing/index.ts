import { Platform } from 'react-native'
module.exports = Platform.select({
  ios: () => require('./index.web'),
  android: () => require('./index.native'),
})()