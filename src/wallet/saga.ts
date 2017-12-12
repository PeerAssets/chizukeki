import { fork, all, put, takeLatest, call } from 'redux-saga/effects'

import { createRoutine } from 'redux-saga-routines';

/*enum Routine {
  Trigger = 'SYNC_UTXO/TRIGGER',
  Request = 'SYNC_UTXO/REQUEST',
  Success = 'SYNC_UTXO/SUCCESS',
  Failure = 'SYNC_UTXO/FAILURE',
  Fulfill = 'SYNC_UTXO/FULFILL',
}*/
const routine = createRoutine('SYNC_UTXO')

async function syncTransactions({ address }) {
  let response = await fetch(`https://explorer.peercoin.net/ext/listunspent/${address}`)
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
