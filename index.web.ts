import { AppRegistry } from 'react-native'
import App from './src';

// App registration and rendering
AppRegistry.registerComponent('editor', () => App)
AppRegistry.runApplication('editor', { rootTag: document.getElementById('root') })
