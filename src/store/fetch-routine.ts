import { fork, all, put, takeLatest, call } from 'redux-saga/effects'

import createRoutine, { BasePayloads } from './routine'

function fetchJSONRoutine<
  ActionPrefix extends string,
  Payloads extends BasePayloads,
  Trigger extends any = any
  >(
  { actionPrefix, fetchJSON, triggers = [] }:
  { actionPrefix: ActionPrefix, fetchJSON: (payload: Payloads['trigger']) => any, triggers?: Array<Trigger> }
){
  const routine = createRoutine<typeof actionPrefix, Payloads>(actionPrefix)
  function* sync({ payload }: { payload: Payloads['trigger'] }) {
    try {
      yield put(routine.request())
      const results = yield call(fetchJSON, payload)
      yield put(routine.success(results))
    } catch (error) {
      yield put(routine.failure(error.message));
    }
  }
  (triggers as Array<Trigger | typeof routine.actions.TRIGGER>).push(routine.actions.TRIGGER)
  function* trigger() {
    yield takeLatest(triggers as any, sync)
  }
  return { routine, sync, trigger }
}

export default fetchJSONRoutine