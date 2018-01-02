import { SagaIterator } from 'redux-saga'
import { fork, all, put, takeLatest, call } from 'redux-saga/effects'
import actionCreatorFactory, { isType, AnyAction, ActionCreator, AsyncActionCreators } from 'typescript-fsa'
import { bindAsyncAction } from 'typescript-fsa-redux-saga'

const actionCreator = actionCreatorFactory()

type Meta = null | {[key: string]: any};

type Block<Payload, Return> = (payload?: Payload) => Return 

function routineSwitch<Start, Success, Error>(
  routine: AsyncActionCreators<Start, Success, Error>
){
  return <Return>(cases: { 
    started: Block<Start, Return>
    done: Block<Success, Return>
    error: Block<Error, Return>
  }) => (action: AnyAction): Return | void => {
    for (let key in cases){
      if(isType(action, routine[key])){
        return cases[key](action)
      }
    }
  }
}

function withSwitch<Start, Success, Error>(
  routine: AsyncActionCreators<Start, Success, Error>
){
  return Object.assign(routine, { switch: routineSwitch(routine) })
}

type Params<Start, Success, Error> = {
  type: string,
  fetchJSON: (payload: Start) => Promise<Success>,
  commonMeta?: Meta
}

function fetchJSONRoutine<Start, Success, Error>({ fetchJSON, type, commonMeta }: Params<Start, Success, Error>) {
  let routine = actionCreator.async<Start, Success, Error>(type, commonMeta)

  const fetchSaga = bindAsyncAction(routine)(
    function* (params): SagaIterator {
      // `params` type is `{foo: string}`
      const results = yield call(fetchJSON, params);
      return results
    },      
  )

  function* trigger() {
    yield takeLatest(routine.type as any, fetchSaga)
  }

  return { trigger, fetchSaga, routine: withSwitch(routine) }
}

export default fetchJSONRoutine