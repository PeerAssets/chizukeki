
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


class ActionAware<ActionType> {
  constructor(public history: Array<ActionType> = []){ }
  push(action: ActionType){
    return new ActionAware<ActionType>([ ...this.history, action ])
  }
  get latest(): ActionType | undefined {
    return this.history[this.history.length - 1]
  }
  valueOf(){
    return this.latest
  }
}

type BindActionHistory<ActionType> = {
  action: ActionAware<ActionType>
}


export { Creator, ActionAware }