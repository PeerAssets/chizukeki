/* taken from react-everywhere/re-start
 * export the appropriate routing and history components for the environment
 */
import * as Routing from 'react-router-native';
export default Routing;
export const Router = Routing.NativeRouter;

import createMemoryHistory from 'history/createMemoryHistory'
export const createHistory = createMemoryHistory
