import { AppRegistry } from 'react-native'
import App from './src';

import * as React from 'react'
import { AppContainer } from 'react-hot-loader'


function wrap(Application) {
  return () =>
    class Wrapper extends React.Component {
      render() {
        return (
          <AppContainer>
            <Application />
          </AppContainer>
        )
      }
    }
}


// App registration and rendering
AppRegistry.registerComponent('peerassets-wallet', wrap(App))
AppRegistry.runApplication('peerassets-wallet', { rootTag: document.getElementById('root') })

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./src', () => {
    const NextApp = require<{default: typeof App}>('./src').default
    AppRegistry.registerComponent('peerassets-wallet', wrap(NextApp))
    AppRegistry.runApplication('peerassets-wallet', { rootTag: document.getElementById('root') })
  })
}

import bootstrapIcons from './web/icons'
bootstrapIcons()