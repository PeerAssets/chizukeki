import { createStore, applyMiddleware, combineReducers } from 'redux';
import { routerReducer as router, routerMiddleware } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage' // handles web/native 

import { createHistory } from '../routing'

import { logger } from './utils'

import  * as Wallet from '../wallet/redux'

export const history = createHistory()

/* Persist to either device or localStorage
 * */
const reducer = persistCombineReducers({ key: 'root', storage }, {
  router,
  wallet: Wallet.reducer
})

const saga = createSagaMiddleware()

export default function configureStore() {
  let store = createStore(
    reducer,
    applyMiddleware(saga, logger, routerMiddleware(history)),
  )
  let persistor = persistStore(store)

  saga.run(Wallet.saga)

  return { store, persistor }
}
