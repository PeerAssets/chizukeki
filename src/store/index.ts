import { createStore, Reducer, applyMiddleware, combineReducers } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'


import { persistStore, persistReducer, createMigrate } from 'redux-persist'
import storage from 'redux-persist/es/storage' // handles web/native 


import { createHistory } from '../routing'

import { logger } from './utils'

import * as Wallet from '../wallet/redux'
import * as Assets from '../assets/redux'

import configure from '../configure'

export const history = (createHistory as any)({ basename: configure.fromEnv().PUBLIC_PATH })

const logoutMigration = state => ({})

const migrations: any = {
  0: logoutMigration,
  1: logoutMigration,
  2: logoutMigration,
  3: logoutMigration,
}

let persist = (key: string, reducer: Reducer<any>) => persistReducer({
  key,
  storage,
  blacklist: ['actionHistory'],
  version: 2,
  migrate: createMigrate(migrations, { debug: false }),
}, reducer)

/* Persist to either device or localStorage
 * */
const reducer = combineReducers({
  router: routerReducer,
  wallet: persist('wallet', Wallet.reducer),
  assets: persist('assets', Assets.reducer),
})

const saga = createSagaMiddleware()

const middleware = configure.fromEnv().DEPLOYMENT_MODE !== 'PRODUCTION' ?
  applyMiddleware(saga, logger, routerMiddleware(history)) :
  applyMiddleware(saga, routerMiddleware(history))

export default function configureStore() {
  let store = createStore(
    reducer,
    middleware
  )
  let persistor = persistStore(store)

  saga.run(Assets.saga)
  saga.run(Wallet.saga)

  return { store, persistor }
}
