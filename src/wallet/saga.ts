import { fork, all, put, call, takeEvery, Pattern } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin, Wallet as ExplorerWallet } from './explorerApi'
import LocalWallet from './Wallet'

import bitcore from '../lib/bitcore'

const syncWallet = fetchJSONRoutine.withPolling<
  Partial<LocalWallet.Loading> & { address: string },
  ExplorerWallet,
  Error
>({
  type: 'SYNC_WALLET',
  fetchJSON: ({ address }) => peercoin.wallet(address),
  pollingInterval: 1 * 60 * 1000, // poll every minute
})

const sendTransaction = fetchJSONRoutine<
  { wallet: LocalWallet.Unlocked, toAddress: string, amount: number },
  any,
  Error
>({
  type: 'SEND_TRANSACTION',
  fetchJSON: ({
    wallet: { address, privateKey, unspentOutputs },
    toAddress, amount
  }) => peercoin.sendRawTransaction({
    changeAddress: address,
    toAddress,
    amount,
    unspentOutputs,
    privateKey,
  })
})

function* cleanup(){
  yield takeEvery('HARD_LOGOUT', () => put(syncWallet.routine.stop()))
}

export default function * (){
  yield all([
    fork(syncWallet.trigger),
    fork(syncWallet.poll),
    fork(sendTransaction.trigger),
    fork(cleanup),
  ])
}

export { syncWallet, sendTransaction }
