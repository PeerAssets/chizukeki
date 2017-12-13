import * as React from 'react'
import { Text, View, Image } from 'react-native'
import { Provider } from "react-redux"
import { PersistGate } from 'redux-persist/es/integration/react'
import EStyleSheet from 'react-native-extended-stylesheet'
import { variables as globalStyles } from './style-variables'
import { ConnectedRouter } from 'react-router-redux'

import { Route } from './routing/router'
import configureStore, { history } from "./store"

import Welcome from './wallet/Container'
import Nav from './Menu'

import {RkTheme} from 'react-native-ui-kitten';
import {LightTheme} from './theme'
RkTheme.setTheme(LightTheme, null);


let { store, persistor } = configureStore()

export default class App extends React.Component<{}> {
  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={<Text>loading</Text>}>
          <ConnectedRouter history={history}>
            <View style={styles.container}>
              <Nav/>
              <Image source={require("./welcome/logomask.png")}
                style={styles.background} />
              <Route path="/" exact component={Welcome} />
              <Route path="/wallet" exact component={Welcome} />
            </View>
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    )
  }
}


const styles = EStyleSheet.create({
  background: {
    position: 'absolute',
    height: 300,
    width: 300,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DADADA',
  },
})

// .build is required regardless of variables
// here we theme, etc
EStyleSheet.build(globalStyles)


