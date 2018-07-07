import { Middleware, MiddlewareAPI, Store, Dispatch, Action } from 'redux'

const logger: Middleware =
  <S>({ getState }: MiddlewareAPI<S>) =>
    (next: Dispatch<S>) =>
      <A extends Action>(action: A): A => {
        if(
          (window as any).debugging && (
            (window as any).debugging === true ||
            action.type.startsWith((window as any).debugging)
          )
        ){
          debugger
        }
        console.log('will dispatch', action)

        // Call the next dispatch method in the middleware chain.
        const returnValue = next(action)

        console.log('state after dispatch', getState())

        // This will likely be the action itself, unless
        // a middleware further in chain changed it.
        return returnValue
      }


export { logger }
