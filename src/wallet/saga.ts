import { fork, all, put, takeLatest, call } from 'redux-saga/effects'
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
  fetchJSON: ({ wallet: { address, privateKey, unspentOutputs }, toAddress, amount }) => peercoin.sendRawTransaction({
    changeAddress: address,
    toAddress,
    amount,
    unspentOutputs,
    privateKey,
  })
})

export default function * (){
  yield all([
    fork(syncWallet.trigger),
    fork(syncWallet.poll),
    fork(sendTransaction.trigger),
  ])
}

export { syncWallet, sendTransaction }
