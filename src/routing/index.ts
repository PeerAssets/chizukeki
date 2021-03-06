/* partially taken from react-everywhere/re-start
 * export the appropriate routing and history components for the environment
 */
import { Platform } from 'react-native'

import Routing, { Router } from './router'

import createBrowserHistory from 'history/createBrowserHistory'
import createMemoryHistory from 'history/createMemoryHistory'

let createHistory: typeof createBrowserHistory | typeof createMemoryHistory  

if(Platform.OS === 'web'){
  createHistory = createBrowserHistory
} else {
  createHistory = createMemoryHistory
}

export { Router, createHistory }

export default Routing
