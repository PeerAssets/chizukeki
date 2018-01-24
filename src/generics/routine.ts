import { bindActionCreators, Dispatch } from 'redux'
import { SagaIterator } from 'redux-saga'
import { put, call, cancelled } from 'redux-saga/effects'
import actionCreatorFactory, { isType, AnyAction, ActionCreator, AsyncActionCreators } from 'typescript-fsa'

// TODO: not sure why this caused trouble
// import { bindAsyncAction } from 'typescript-fsa-redux-saga'
function bindAsyncAction(
  creator: AsyncActionCreators<any, any, any>,
  throwing: boolean = false
) {
  return (worker: (params: any, ...args: any[]) => Promise<any> | SagaIterator) => {
    return function* boundAsyncActionSaga(params: any, ...args: any[]): SagaIterator {
      yield put(creator.started(params));
      try {
        const result = yield (call as any)(worker, params, ...args);
        yield put(creator.done({params, result}));
        return result;
      } catch (error) {
        yield put(creator.failed({params, error}));
        if(throwing){
          throw error
        }
      } finally {
        if (yield cancelled()) {
          yield put(creator.failed({params, error: 'cancelled'}));
        }
      }
    }
  };
}

const actionCreator = actionCreatorFactory()

type Meta = null | {[key: string]: any};

type IncludePayload<Payload, Return> = (payload: Payload) => Return
type IgnorePayload<Return> = () => Return

type Block<Payload, Return> = IncludePayload<Payload, Return>
  | IgnorePayload<Return>

function isUncallable<Return>(u: any): u is Return {
  return typeof(u) !== 'function'
}

function ignore<T>(u: any): u is T {
  return false
}

function handleOptionalPayload<Payload, Return>(f: Block<Payload, Return>, payload: Payload){
  if(ignore<IgnorePayload<Return>>(f)){
    throw Error('impossible')
  }
  return f(payload)
}

function routineSwitch<Start, Success, Error>(
  routine: AsyncActionCreators<Start, Success, Error>
){
  return <Return>(action: AnyAction, cases: { 
    started: Block<Start, Return> | Return
    done: Block<Success, Return> | Return
    failed: Block<Error, Return> | Return
  }): Return | void => {
    if(isType(action, routine.started)){
      return isUncallable<Return>(cases.started) ?
        cases.started :
        handleOptionalPayload(cases.started, action.payload)
    }
    if(isType(action, routine.done)){
      return isUncallable<Return>(cases.done) ?
        cases.done :
        handleOptionalPayload(cases.done, action.payload.result)
    }
    if(isType(action, routine.failed)){
      return isUncallable<Return>(cases.failed) ?
        cases.failed :
        handleOptionalPayload(cases.failed, action.payload.error)
    }
  }
}

namespace Routine {
  export type Stage = 'STARTED' | 'DONE' | 'FAILED' | undefined
}

type Routine<Start, Success, Error> =
  AsyncActionCreators<Start, Success, Error>
  & {
    currentStage?: Routine.Stage,
    allTypes: Array<string>,
    trigger: ActionCreator<Start>,
    switch<Return>(action: AnyAction, cases: { 
      started: Block<Start, Return> | Return
      done: Block<Success, Return> | Return
      failed: Block<Error, Return> | Return
    }): Return | void,
    stage(action: AnyAction | string | undefined): Routine.Stage | void
  }

function expandedRoutine<Start, Success, Error>(type: string, commonMeta?: Meta): Routine<Start, Success, Error>{
  let routine = actionCreator.async<Start, Success, Error>(type, commonMeta)
  return Object.assign(routine, {
    trigger: actionCreator<Start>(type),
    switch: routineSwitch<Start, Success, Error>(routine),
    allTypes: [type, ...['STARTED', 'DONE', 'FAILED'].map(stage => `${type}_${stage}`)],
    stage(action: AnyAction | string | undefined){
      if(action === undefined){ return }
      action = typeof(action) === 'string' ? { type: action } : action
      return (
        this as Routine<Start, Success, Error>
      ).switch<'STARTED' | 'DONE' | 'FAILED' | void>(
        action,
        {
          started: 'STARTED',
          done: 'DONE',
          failed: 'FAILED',
        }
      )
    },
    withStage(action: AnyAction | string | undefined){
      let self = this as Routine<Start, Success, Error>
      return Object.assign({}, self, { currentStage: self.stage(action) })
    }
  })
}

export default expandedRoutine

export { bindAsyncAction, Meta, Routine }