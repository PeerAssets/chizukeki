import { fork, all, put, call, takeLatest } from 'redux-saga/effects'
import fetchJSONRoutine, { interval } from '../generics/fetch-routine'
import { peercoin, Wallet as ExplorerWallet } from '../explorer'
import LocalWallet from './Wallet'

import bitcore from '../lib/bitcore'

const syncWallet = fetchJSONRoutine.withPolling<
  Partial<LocalWallet.Loading> & {
    address: string,
    cachedTransactionIds?: Array<string>
  },
  ExplorerWallet,
  Error
>({
  type: 'SYNC_WALLET',
  fetchJSON: ({ address, cachedTransactionIds }) => peercoin.wallet(address, cachedTransactionIds),
  pollingInterval: interval({ seconds: 30 })
})

const sendTransaction = fetchJSONRoutine<
  { wallet: LocalWallet.Unlocked, toAddress: string, amount: number },
  ExplorerWallet.PendingTransaction,
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
  yield takeLatest('HARD_LOGOUT', () => put(syncWallet.routine.stop()))
}

export default function * (){
  yield all([
    syncWallet.trigger(),
    syncWallet.poll(),
    sendTransaction.trigger(),
    cleanup(),
  ])
}

export { syncWallet, sendTransaction }
