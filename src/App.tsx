import * as React from 'react'
import { View, Image, Text, StyleSheet, ScrollView, ScrollViewProperties } from 'react-native'
import { Provider } from "react-redux"
import { PersistGate } from 'redux-persist/es/integration/react'
import { ConnectedRouter } from 'connected-react-router'

import { Route, Redirect } from './routing/router'
import { Switch, withRouter } from 'react-router-dom'
import configureStore, { history } from "./store"

import Nav from './Menu'
import Fallback from './wallet/Fallback'
import Wallet from './wallet/Container'
import Login from './wallet/LoginContainer'
import AuthenticatedRoute from './wallet/AuthenticatedRoute'
import Assets from './assets/Container'
import Asset from './assets/AssetContainer'

import { StyleProvider, variables, Root } from 'native-base';
import theme from './theme'

let { store, persistor } = configureStore()

variables.iconFamily = 'FontAwesome'

function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={<Text>loading</Text>}>
        <StyleProvider style={theme(variables)}>
          <Root style={styles.wrapper}>
            <ConnectedRouter history={history}>
              <ScrollView contentContainerStyle={styles.container}>
                <Fallback>
                  <Nav />
                  <Switch>
                    <AuthenticatedRoute path="/" exact component={() => <Redirect to='/wallet' />} />
                    <AuthenticatedRoute path="/wallet" exact component={Wallet} />
                    <AuthenticatedRoute path="/assets" exact component={Assets} />
                    <AuthenticatedRoute path="/assets/:id" exact component={Asset} />
                    <Route path="/login" exact component={Login} />
                  </Switch>
                </Fallback>
              </ScrollView>
            </ConnectedRouter>
          </Root>
        </StyleProvider>
      </PersistGate>
    </Provider>
  )
}


const styles = StyleSheet.create({
  wrapper: {
    minHeight: '100%',
    width: '100%',
    backgroundColor: '#DADADA',
  },
  background: {
    position: 'absolute',
    height: 300,
    width: 300,
    bottom: 0,
    left: 0,
    zIndex: 0,
  },
  container: {
    minHeight: '100%',
    paddingTop: 50,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#DADADA',
    flexShrink: 0
  },
})

export default App