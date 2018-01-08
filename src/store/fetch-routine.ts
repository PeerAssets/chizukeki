import { takeLatest } from 'redux-saga/effects'
import actionCreatorFactory, { isType, AnyAction, ActionCreator, AsyncActionCreators } from 'typescript-fsa'
import expandedRoutine, { bindAsyncAction, Meta } from './routine'

type Params<Start, Success, Error> = {
  type: string,
  fetchJSON: (payload: Start) => Promise<Success>,
  commonMeta?: Meta
}

function fetchJSONRoutine<Start, Success, Error>({ fetchJSON, type, commonMeta }: Params<Start, Success, Error>) {
  type Trigger = { type: string, payload: Start }

  let routine = expandedRoutine<Start, Success, Error>(type, commonMeta)

  const fetchSaga = bindAsyncAction(routine)(fetchJSON)

  function* trigger() {
    yield takeLatest(routine.trigger, (action: Trigger) => fetchSaga(action.payload))
  }

  return { trigger, fetchSaga, routine }
}

export default fetchJSONRoutine