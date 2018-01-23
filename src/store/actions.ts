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

type ActionHistory<ActionType> = {
  following: Array<ActionType>,
  history: Array<ActionType>,
  latest: ActionType | undefined,
}

namespace ActionHistory {
  export type Bind<ActionType extends string = string> = {
    actionHistory: ActionHistory<ActionType>
  }
  export function of<ActionType extends string = string>(following: Array<ActionType>) {
    return {
      actionHistory: {
        history: [],
        following,
        latest: undefined 
      }
    }
  }
  export function push<ActionType extends string = string>(
    ah: ActionHistory<ActionType>, action: ActionType
  ){ if(ah.following.includes(action)){
      ah.history.push(action)
      ah.latest = action
    }
    return ah
  }
  export function filter<ActionType extends string = string>(
    filter: (action: ActionType) => boolean,
    { history, following, latest }: ActionHistory<ActionType>, 
  ){
    history = history.filter(filter)
    return {
      history,
      following: following.filter(filter),
      latest: history[history.length - 1]
    }
  }
  export function filterWithPrefix<ActionType extends string = string>(
    prefix: string,
    { history, following, latest }: ActionHistory<ActionType>, 
  ){
    let filter = (action: ActionType) => action.startsWith(prefix)
    history = history.filter(filter)
    return {
      history,
      following: following.filter(filter),
      latest: history[history.length - 1]
    }
  }
  export function bind<
    ActionType extends string = string,
    S extends Bind<ActionType> = Bind<ActionType>
  >(reducer: Reducer<S>){
    return (_state: S, action): S => {
      // we call the reducer first in case initialState was provided there
      let state = reducer(_state, action)
      state.actionHistory = push(state.actionHistory, action.type)
      return state
    }
  }
}


export { Creator, ActionHistory }