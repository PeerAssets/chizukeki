import { Creator, Switch } from './actions'

enum RoutineAction {
  Trigger = 'TRIGGER',
  Request = 'REQUEST',
  Success = 'SUCCESS',
  Failure = 'FAILURE',
  Fulfill = 'FULFILL',
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

function createRoutine<
  Prefix extends string,
  Payloads extends BasePayloads
>(prefix: Prefix){
  let actions = routineActions(prefix)
  let creators = routineCreators<Prefix, Payloads>(actions)
  return {
    actions,
    switch: Switch.Dict(actions),
    ...creators
  }
}

let routine = createRoutine('FETCH')
routine.switch<'t'>({
  TRIGGER: 't',
  REQUEST: 't',
  SUCCESS: 't',
  FAILURE: 't',

  DEFAULT: 't'
})

export default createRoutine

export {

  RoutineAction,
  RoutineActions,

  BasePayloads,

  routineActions,
  routineCreators

}