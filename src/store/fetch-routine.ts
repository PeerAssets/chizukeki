import { fork, all, put, takeLatest, call } from 'redux-saga/effects'

import createRoutine, { BasePayloads } from './routine'

function fetchJSONRoutine<
  ActionPrefix extends string,
  Payloads extends BasePayloads
  >(
  { actionPrefix, fetchJSON }:
  { actionPrefix: ActionPrefix, fetchJSON: (payload: Payloads['trigger']) => any }
){
  const routine = createRoutine<typeof actionPrefix, {
  }>(actionPrefix)
  function* sync({ payload }: { payload: Payloads['trigger'] }) {
    try {
      yield put(routine.request())
      const results = yield call(fetchJSON, payload)
      yield put(routine.success(results))
    } catch (error) {
      yield put(routine.failure(error.message));
    }
  }
  function* trigger() {
    yield takeLatest(routine.actions.TRIGGER as any, sync)
  }
  return { routine, sync, trigger }
}

export default fetchJSONRoutine