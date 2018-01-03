import { SagaIterator } from 'redux-saga'
import { fork, all, put, takeLatest, call, cancelled } from 'redux-saga/effects'
import actionCreatorFactory, { isType, AnyAction, ActionCreator, AsyncActionCreators } from 'typescript-fsa'
//import { bindAsyncAction } from 'typescript-fsa-redux-saga'

const actionCreator = actionCreatorFactory()

type Meta = null | {[key: string]: any};

type Block<Payload, Return> = (payload?: Payload) => Return 

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

function expandedRoutine<Start, Success, Error>(type: string, commonMeta?: Meta){
  let routine = actionCreator.async<Start, Success, Error>(type, commonMeta)
  return Object.assign(routine, {
    trigger: actionCreator<Start>(type),
    switch: routineSwitch(routine),
  })
}

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

type Params<Start, Success, Error> = {
  type: string,
  fetchJSON: (payload: Start) => Promise<Success>,
  commonMeta?: Meta
}

function fetchJSONRoutine<Start, Success, Error>({ fetchJSON, type, commonMeta }: Params<Start, Success, Error>) {
  type Trigger = { type: string, payload: Start }

  let routine = expandedRoutine(type, commonMeta)

  const fetchSaga = bindAsyncAction(routine)(fetchJSON)

  function* trigger() {
    yield takeLatest(routine.trigger, (action: Trigger) => fetchSaga(action.payload))
  }

  return { trigger, fetchSaga, routine }
}

export default fetchJSONRoutine