/* taken from react-everywhere/re-start
 * export the appropriate routing and history components for the environment
 */
import * as Routing from 'react-router-dom';
export default Routing;
export const Router = Routing.BrowserRouter;

import createBrowserHistory from 'history/createBrowserHistory'
export const createHistory = createBrowserHistory

