import { bindActionCreators, Dispatch } from 'redux'
import { SagaIterator } from 'redux-saga'
import { put, call, cancelled } from 'redux-saga/effects'
import actionCreatorFactory, { isType, AnyAction, ActionCreator, AsyncActionCreators } from 'typescript-fsa'


// TODO: not sure why this caused trouble
// import { bindAsyncAction } from 'typescript-fsa-redux-saga'
function bindAsyncAction(
  actionCreator: AsyncActionCreators<any, any, any>,
) {
  return (worker: (params: any, ...args: any[]) => Promise<any> | SagaIterator) => {
    return function* boundAsyncActionSaga(params: any, ...args: any[]): SagaIterator {
      yield put(actionCreator.started(params));

      try {
        const result = yield (call as any)(worker, params, ...args);
        yield put(actionCreator.done({params, result}));
        return result;
      } catch (error) {
        yield put(actionCreator.failed({params, error}));
        throw error;
      } finally {
        if (yield cancelled()) {
          yield put(actionCreator.failed({params, error: 'cancelled'}));
        }
      }
    }
  };
}

const actionCreator = actionCreatorFactory()

type Meta = null | {[key: string]: any};

type Block<Payload, Return> = (payload?: Payload) => Return 
  | (() => Return)

function routineSwitch<Start, Success, Error>(
  routine: AsyncActionCreators<Start, Success, Error>
){
  return <Return>(action: AnyAction, cases: { 
    started: Block<Start, Return>
    done: Block<Success, Return>
    failed: Block<Error, Return>
  }): Return | void => {
    for (let key in cases){
      if(isType(action, routine[key])){
        return cases[key](action.payload)
      }
    }
  }
}

type Routine<Start, Success, Error> =
  AsyncActionCreators<Start, Success, Error>
  & {
    trigger: ActionCreator<Start>,
    switch<Return>(action: AnyAction, cases: { 
      started: Block<Start, Return>
      done: Block<Success, Return>
      failed: Block<Error, Return>
    }): Return | void
    allTypes: Array<string>
  }

function expandedRoutine<Start, Success, Error>(type: string, commonMeta?: Meta): Routine<Start, Success, Error>{
  let routine = actionCreator.async<Start, Success, Error>(type, commonMeta)
  return Object.assign(routine, {
    trigger: actionCreator<Start>(type),
    switch: routineSwitch(routine),
    get allTypes(): Array<string> {
      return ['trigger', 'started', 'done', 'failed']
        .map(action => this[action].type)
    },
  })
}

export default expandedRoutine

export { bindAsyncAction, Meta, Routine }