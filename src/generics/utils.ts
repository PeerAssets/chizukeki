import ActionHistory from './action-history'
import { Reducer } from 'redux';

// utils
function routineStages(routines){
  return actionHistory => Object.keys(routines)
    .reduce((stages, key) => {
      let routine = routines[key]
      let latestRoutineAction = ActionHistory.filterWithPrefix(routine.trigger.type, actionHistory).latest
      stages[key] = routine.stage(latestRoutineAction)
      return stages
    }, {})
}

type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];  
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;  

// adds the routine stages to the state under the given key (default = routineStages)
function trackRoutineStages<Key extends string>(routineMap: object, stateKey = 'routineStages'){
  // todo don't want to struggle with these types r/n
  // type BaseState = { [Key]:{ [key in typeof routineMap]: string | undefined } }
  // <S extends BaseState>(reducer: Reducer<S>)
  return (reducer) =>
    (_state, action) /*: S*/ => {
      let stages = {...(_state && _state[stateKey]) || {}}
      let state = reducer(_state, action)
      for (let [key, routine] of Object.entries(routineMap)) {
        let stage = routine.stage(action)
        if(stage){
          stages[key] = routine.stage(action)
          break
        }
      }
      return Object.assign({}, state, stages)
    }
}

export { trackRoutineStages, routineStages, Diff, Omit }