import { fork, all, put, takeLatest, call } from 'redux-saga/effects'

import { createRoutine } from 'redux-saga-routines';

const routine = createRoutine('FETCH_UNSPENT_TRANSACTIONS')


// P9AqJKeEe9Y8e9j4zF88mzD7gm5UG928iP
async function syncTransactions({ privateKey }) {
  let response = await fetch(`https://explorer.peercoin.net/ext/listunspent/${privateKey}`)
  let { unspent_outputs } = await response.json()
  return unspent_outputs
}

function* sync({ payload }) {
  try {
    yield put(routine.request())
    const unspentOutputs = yield call(syncTransactions, payload)
    yield put(routine.success({ unspentOutputs }))

  } catch (error) {
    yield put(routine.failure(error.message));

  } finally {
    yield put(routine.fulfill())
  }
}

export default function* trigger() {
  yield takeLatest([routine.TRIGGER, 'LOAD_PRIVATE_KEY'] as any, sync)
}

export { routine }
