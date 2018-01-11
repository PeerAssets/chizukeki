import { fork, all, put, takeLatest, call } from 'redux-saga/effects'
import fetchJSONRoutine from '../store/fetch-routine'
import cryptoid, { Wallet } from './explorerApi/cryptoid'

const { routine, fetchSaga: sync, trigger } = fetchJSONRoutine<
  { privateKey: string, address: string },
  Wallet,
  Error
>({
  type: 'FETCH_TRANSACTIONS',
  fetchJSON: ({ address }) => cryptoid.wallet(address),
})

export default trigger

export { routine, sync }
