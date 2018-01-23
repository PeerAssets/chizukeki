import { fork, all, put, takeLatest, call } from 'redux-saga/effects'
import fetchJSONRoutine, { poll } from '../store/fetch-routine'
import { peercoin, Wallet as ExplorerWallet } from './explorerApi'
import LocalWallet from './Wallet'

import bitcore from '../lib/bitcore'

const syncWallet = fetchJSONRoutine.withPolling<
  { privateKey: string, address: string },
  ExplorerWallet,
  Error
>({
  type: 'SYNC_WALLET',
  fetchJSON: ({ address }) => peercoin.wallet(address),
  pollingInterval: 20000,
})

const sendTransaction = fetchJSONRoutine<
  { wallet: LocalWallet.Data, toAddress: string, amount: number },
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
