import { Satoshis, HTTP } from '../lib/utils'

namespace Wallet {
  export type UTXO = {
    txid: string,
    scriptPubKey: string | {
      addresses: Array<string>,
      asm: string,
      hex: string,
      reqSigs: number,
      type: string,
    },
    vout: number,
    amount: number,
    // unused address, confirmations
  }
  export type Transaction = {
    balance: number,
    amount: number,
    fee: number,
    id: string,
    confirmations: number,
    timestamp: Date,
    raw?: {
      [key: string]: any,
      vout: Array<UTXO>,
      vin: Array<any>,
    }
  }
  export type PendingTransaction = Pick<Transaction, 'id' | 'amount' | 'timestamp' | 'raw' | 'fee'>
  export function empty(address: string): Wallet {
    return Object.assign(
      walletMeta(), {
        address,
        balance: 0,
        sent: 0,
        received: 0,
        totalTransactions: 0,
        transactions: [],
        unspentOutputs: []
    })
  }
}

type Wallet = {
  _meta: {
    created: Date,
    updated: Date,
    syncState: 'DEFAULT' | 'OPTIMISTICALLY_PENDING'
  },
  address: string,
  received: number,
  sent: number,
  balance: number,
  totalTransactions: number,
  transactions: Array<Wallet.Transaction>,
  unspentOutputs: Array<Wallet.UTXO>
}

export function walletMeta(): Pick<Wallet, '_meta'> {
  let created = new Date()
  return {
    _meta: {
      created,
      updated: created,
      syncState: 'DEFAULT'
    }
  }
}

export { Wallet, Satoshis, HTTP }
