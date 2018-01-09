import { Reducer } from 'redux'

type Creator<T, P> = (payload: P) => {
  type: T, 
  payload: P
}

function Creator<T, P>(type: T): Creator<T, P> {
  return (payload: P) => ({ type, payload })
}

namespace Creator {
  export type Empty<T> = () => { type: T }
  export function Empty<T>(type: T): Empty<T> {
    return () => ({ type })
  }
}


class ActionHistory<ActionType extends string = string> {
  constructor(
    public following: Array<ActionType>,
    public history: Array<ActionType> = []
  ){ }
  push(action: ActionType){
    return this.following.includes(action) ?
      new ActionHistory<ActionType>(this.following, [ ...this.history, action ]) :
      this
  }
  get latest(): ActionType | undefined {
    return this.history[this.history.length - 1]
  }
}

namespace ActionHistory {
  export type Bind<ActionType extends string = string> = {
    actionHistory: ActionHistory<ActionType>
  }
  export function initialState<ActionType extends string = string>(following: Array<ActionType>) {
    return { actionHistory: new ActionHistory<ActionType>(following) }
  }
  export function bind<
    ActionType extends string = string,
    S extends Bind<ActionType> = Bind<ActionType>
  >(reducer: Reducer<S>, initialState?: Bind<ActionType>){
    return (_state: S, action) => {
      // we call the reducer first in case initialState was provided there
      let state = reducer(_state, action)
      let actionHistory = state.actionHistory || (initialState && initialState.actionHistory)
      return Object.assign({}, state, { actionHistory: actionHistory.push(action.type) })
    }
  }
}


export { Creator, ActionHistory }