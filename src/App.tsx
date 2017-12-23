import * as React from 'react'
import { View, Image, Text } from 'react-native'
import { Provider } from "react-redux"
import { PersistGate } from 'redux-persist/es/integration/react'
import EStyleSheet from 'react-native-extended-stylesheet'
import { ConnectedRouter } from 'react-router-redux'

import { Route } from './routing/router'
import configureStore, { history } from "./store"

import Wallet from './wallet/Container'
import Nav from './Menu'

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
              <Route path="/" exact component={Wallet} />
              <Route path="/wallet" exact component={Wallet} />
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
