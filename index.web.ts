import { AppRegistry } from 'react-native'
import App from './src';

// App registration and rendering
AppRegistry.registerComponent('peerassets-wallet', () => App)
AppRegistry.runApplication('peerassets-wallet', { rootTag: document.getElementById('root') })
