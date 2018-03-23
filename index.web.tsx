import { AppRegistry } from 'react-native'
import App from './src/index.web';

import * as React from 'react'
import { AppContainer } from 'react-hot-loader'

// App registration and rendering
AppRegistry.registerComponent('peerassets-wallet', () => App)
AppRegistry.runApplication('peerassets-wallet', { rootTag: document.getElementById('root') })

import injectFonts from './web/fonts'
injectFonts()