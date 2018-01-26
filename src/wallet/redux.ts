import PrivateKey from './LoadPrivateKey'
import Wallet from './Wallet'

import ActionHistory from '../generics/action-history'
import Saga, { syncWallet, sendTransaction } from './saga'
import { AnyAction } from 'typescript-fsa';


export type State = { wallet?: undefined | Wallet.Loading | Wallet.Data } & ActionHistory.Bind

let actionHistory = ActionHistory.of([
  ...syncWallet.routine.allTypes,
  ...sendTransaction.routine.allTypes,
])

function applyTransaction(
  { balance, transactions, ...wallet }: Wallet.Data,
  { amount, ...transaction }: Wallet.PendingTransaction
): Wallet.Data {
  balance = balance - amount
  return {
    ...wallet,
    balance,
    transactions: [
      { balance, amount: - amount, confirmations: 0, ...transaction },
      ...transactions
    ]
  }
}

function preservePendingTransactions(
  old: Array<Wallet.Transaction | Wallet.PendingTransaction>,
  synced: Array<Wallet.Transaction>
){
  let syncedIds = synced.map(t => t.id)
  // transactions are in decending order
  return [
    ...synced,
    ...old.filter(t => !syncedIds.includes(t.id)),
  ]
}

function applySync({ old, synced }: {
  old: Wallet.Loading | Wallet.Data,
  synced: Wallet.Synced,
}): Wallet.Data {
  return Object.assign(
    old,
    synced,
    { transactions: preservePendingTransactions(Wallet.isLoaded(old) ? old.transactions : [], synced.transactions) }
  )
}

function walletReducer(state: State = actionHistory, action: AnyAction): State {
  return syncWallet.routine.switch<State>(action, {
    started: payload => {
      if(!payload.privateKey){
        return state
      }
      if(!state.wallet){
        return {
          ...state,
          wallet: payload as Wallet.Data
        }
      }
      return state
    },
    done: (payload) => ({
      ...state,
      wallet: state.wallet ? applySync({ old: state.wallet, synced: payload }) : state.wallet
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