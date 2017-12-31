import { curry, __, mapObjIndexed, chain, pick, pipe } from 'ramda'
import { bindActionCreators, Dispatch, ActionCreatorsMapObject } from 'redux'
import { Creator, Switch } from './actions'

enum RoutineAction {
  Trigger = 'TRIGGER',
  Request = 'REQUEST',
  Success = 'SUCCESS',
  Failure = 'FAILURE',
}

type Types<Prefix extends string> = {
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
  failure: Error
}>

type FullActions<Prefix extends string, Payloads extends BasePayloads> =
  | { type: [Prefix, RoutineAction.Trigger], payload: BasePayload['trigger']}
  | { type: [Prefix, RoutineAction.Request], payload: BasePayload['request']}
  | { type: [Prefix, RoutineAction.Success], payload: BasePayload['success']}
  | { type: [Prefix, RoutineAction.Failure], payload: BasePayload['failure']}

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


function routineActions<Prefix extends string>(prefix: Prefix): Types<Prefix> {
  return {
    TRIGGER: [ prefix, RoutineAction.Trigger ],
    REQUEST: [ prefix, RoutineAction.Request ],
    SUCCESS: [ prefix, RoutineAction.Success ],
    FAILURE: [ prefix, RoutineAction.Failure ],
  }
}

type RoutineCreators<Prefix extends string, Payloads extends BasePayloads> = {
  trigger: Creator<Types<Prefix>['TRIGGER'], Payloads['trigger']>,
  request: Creator.Empty<Types<Prefix>['REQUEST']>,
  success: Creator<Types<Prefix>['SUCCESS'], Payloads['success']>,
  failure: Creator<Types<Prefix>['FAILURE'], Payloads['failure']>,
}

function routineCreators<
  Prefix extends string,
  Payloads extends BasePayloads
>(actions: Types<Prefix>){
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

class Routine<Prefix extends string, Payloads extends BasePayloads>{
  types: Types<Prefix>
  switch: Switch.Dict<keyof Types<Prefix>>
  // for type extraction
  _Types: ActionTuple<Prefix>
  _Actions: FullActions<Prefix, Payloads>
  creators: RoutineCreators<Prefix, Payloads>
  constructor(prefix: Prefix){
    this.types = routineActions(prefix)
    this.creators = routineCreators<Prefix, Payloads>(this.types)
    this.switch = Switch.Dict(this.types)
  }
}

function createRoutine<
  Prefix extends string,
  Payloads extends BasePayloads
>(prefix: Prefix){
  return new Routine<Prefix, Payloads>(prefix)
}

export default createRoutine

export {
  RoutineAction,
  Types,

  BasePayloads,

  routineActions,
  routineCreators,

  bindRoutineActions,
  extractRoutineActions 
}