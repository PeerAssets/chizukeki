import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import { ActionHistory } from '../store/actions'
import Saga, { syncWallet, sendTransaction } from './saga'
import { AnyAction } from 'typescript-fsa';


export type State = { wallet?: undefined | Wallet.Loading | Wallet.Data } & ActionHistory.Bind

let actionHistory = ActionHistory.of([
  ...syncWallet.routine.allTypes,
  ...sendTransaction.routine.allTypes,
])

function applyTransaction(
  { balance, transactions, ...wallet }: Wallet.Data,
  transaction: Wallet.PendingTransaction
): Wallet.Data {
  balance = balance - transaction.amount
  return {
    ...wallet,
    balance,
    transactions: [
      { balance, confirmations: 0, ...transaction },
      ...transactions
    ]
  }
}

function walletReducer(state: State = ActionHistory.of(syncWallet.routine.allTypes), action: AnyAction): State {
  return syncWallet.routine.switch<State>(action, {
      started: payload => ({
        ...state,
        wallet: payload
      }),
      done: (payload) => ({
        ...state,
        wallet: Object.assign(state.wallet, payload)
      }),
      failed: () => state
    }) ||
    sendTransaction.routine.switch<State>(action, {
      started: payload => state,
      done: (payload) => ({
        ...state,
        // an unloaded wallet here shouldn't be possible
        wallet: Wallet.isLoaded(state.wallet) ? applyTransaction(state.wallet, payload) : state.wallet,
      }),
      failed: () => state
    }) ||
    state
}

export const reducer = ActionHistory.bind(walletReducer)
export const saga = Saga
export const routines = {
  sync: syncWallet.routine,
  sendTransaction: sendTransaction.routine
}