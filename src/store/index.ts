import { createStore, applyMiddleware, combineReducers } from 'redux';
import { routerReducer as router, routerMiddleware } from 'react-router-redux'
import { persistStore, persistCombineReducers } from 'redux-persist'
import storage from 'redux-persist/es/storage' // handles web/native 

import { createHistory } from '../routing'

import { logger } from './utils'

export const history = createHistory()

/* Persist to either device or localStorage
 * */
const reducer = persistCombineReducers({ key: 'root', storage }, { router })

export default function configureStore() {
  let store = createStore(
    reducer,
    applyMiddleware(logger, routerMiddleware(history)),
  )
  let persistor = persistStore(store)
  return { store, persistor }
}
