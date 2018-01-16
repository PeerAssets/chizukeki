import { fork, all, put, takeLatest, call } from 'redux-saga/effects'
import fetchJSONRoutine from '../store/fetch-routine'
import { peercoin, Wallet } from './explorerApi'

window['api'] = peercoin

const { routine, fetchSaga: sync, trigger } = fetchJSONRoutine<
  { privateKey: string, address: string },
  Wallet,
  Error
>({
  type: 'SYNC_WALLET',
  fetchJSON: ({ address }) => peercoin.wallet(address),
})

export default trigger

export { routine, sync }
