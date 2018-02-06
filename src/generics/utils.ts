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

export { routineStages }