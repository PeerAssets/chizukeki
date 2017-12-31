import { curry, __, mapObjIndexed, chain, pick, pipe } from 'ramda'
import { bindActionCreators, Dispatch, ActionCreatorsMapObject } from 'redux'
import { Creator, Switch } from './actions'

enum RoutineAction {
  Trigger = 'TRIGGER',
  Request = 'REQUEST',
  Success = 'SUCCESS',
  Failure = 'FAILURE',
}

type RoutineActions<Prefix extends string> = {
  TRIGGER: [ Prefix, RoutineAction.Trigger ],
  REQUEST: [ Prefix, RoutineAction.Request ],
  SUCCESS: [ Prefix, RoutineAction.Success ],
  FAILURE: [ Prefix, RoutineAction.Failure ],
}

type ActionTuple<Prefix extends string> = 
  | [ Prefix, RoutineAction.Trigger ]
  | [ Prefix, RoutineAction.Request ]
  | [ Prefix, RoutineAction.Success ]
  | [ Prefix, RoutineAction.Failure ]

type BasePayload = any

type BasePayloads = Partial<{
  trigger: BasePayload,
  request: BasePayload,
  success: BasePayload
  failure: BasePayload
}>

// TODO maybe there's a type level way to dry this up,
// unfinished because switch is complicated
/* or there will be in the future
type Routine<Prefix extends string, Payloads extends BasePayloads> = {
  actions: RoutineActions<Prefix>,
  switch: Switch.Dict(actions),

  trigger: Creator<[ Prefix, RoutineAction.Trigger ], Payloads['trigger']>,
  request: Creator.Empty<[ Prefix, RoutineAction.Request ]>,
  success: Creator<[ Prefix, RoutineAction.Success ], Payloads['success']>,
  failure: Creator<[ Prefix, RoutineAction.Failure ], Payloads['failure']>,
}
*/


function routineActions<Prefix extends string>(prefix: Prefix): RoutineActions<Prefix> {
  return {
    TRIGGER: [ prefix, RoutineAction.Trigger ],
    REQUEST: [ prefix, RoutineAction.Request ],
    SUCCESS: [ prefix, RoutineAction.Success ],
    FAILURE: [ prefix, RoutineAction.Failure ],
  }
}

function routineCreators<
  Prefix extends string,
  Payloads extends BasePayloads
>(actions: RoutineActions<Prefix>){
  return {
    trigger: Creator<typeof actions.TRIGGER, Payloads['trigger']>(actions.TRIGGER),
    request: Creator.Empty<typeof actions.REQUEST>(actions.REQUEST),
    success: Creator<typeof actions.SUCCESS, Payloads['success']>(actions.SUCCESS),
    failure: Creator<typeof actions.FAILURE, Payloads['failure']>(actions.FAILURE),
  }
}

function bindRoutineActions(
  routines: { [routine: string]: ActionCreatorsMapObject & any },
  dispatch: Dispatch<any>
){
  return mapObjIndexed(
    pipe(
      pick(['trigger', 'request', 'success', 'failure']),
      curry(bindActionCreators)(__, dispatch)
    ),
    routines
  )
}

function extractRoutineActions(
  routines: { [routine: string]: ActionCreatorsMapObject & any },
) {
  return mapObjIndexed(
    pick(['trigger', 'request', 'success', 'failure']),
    routines
  )
}

function createRoutine<
  Prefix extends string,
  Payloads extends BasePayloads
>(prefix: Prefix){
  let actions = routineActions(prefix)
  let _Actions: ActionTuple<Prefix> = actions.TRIGGER // for extracting the Action type

  let creators = routineCreators<Prefix, Payloads>(actions)
  return {
    actions,
    _Actions,
    switch: Switch.Dict(actions),
    ...creators
  }
}

export default createRoutine

export {
  RoutineAction,
  RoutineActions,

  BasePayloads,

  routineActions,
  routineCreators,

  bindRoutineActions,
  extractRoutineActions 
}