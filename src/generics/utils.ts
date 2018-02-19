import ActionHistory from './action-history'

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

export { routineStages, Diff, Omit }