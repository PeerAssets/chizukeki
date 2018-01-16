import bitcore from '../../lib/bitcore'
import { getJSON, stringifyQuery, Satoshis, normalizeSatoshis, Wallet, walletMeta } from './common'

namespace ApiCalls {
  export type Coind = 
    | 'getdifficulty'
    | 'connectioncount'
    | 'getblockcount'
    | 'getrawtransaction'
    | 'sendrawtransaction'

  export type Extended = 
    | 'getaddress'
    | 'listunspent'
    | 'txinfo'
    | 'getbalance'
}

type ApiCalls = ApiCalls.Coind | ApiCalls.Extended

namespace RawTransaction {
  export type UTXO = {
    value: number,
    n: number,
    scriptPubKey: any
  }
}

type RawTransaction = {
  txid: string,
  time: number,
  confirmations: number,
  vout: Array<RawTransaction.UTXO>,
  vin: Array<any>,
  blockhash: string,
  blocktime: number
}


namespace TxInfo {
  export type Input = {
    addresses: string,
    txid?: string, 
    amount: Satoshis
  }
  export type Output = {
    script: string,
    amount: Satoshis
  }

  export type Response = {
    hash: string,
    block: number,
    timestamp: number,
    total: Satoshis,
    inputs: Array<Input>,
    outputs: Array<Output>,
  }

}

namespace GetAddress {
  type TxReference = string
  export type Transaction = {
    addresses: TxReference,
    type: string
  }
  export type Response = {
    address: string,
    sent: number,
    received: number,
    balance: number,
    last_txs: Array<Transaction>,
  }
}

namespace normalize {

  export const satoshis = normalizeSatoshis

  export function transactions(balance: number, txs: Array<RawTransaction>){
    let nTransactions: Array<Wallet.Transaction> = []
    for (let { txid: id, confirmations, time, vout } of txs ){
      let amount = vout.reduce((a, { value }) => a + value, 0)
      nTransactions.push({
        id,
        confirmations,
        amount,
        balance,
        timestamp: new Date(time)
      })
      balance -= amount
    }
    return nTransactions
  }

  export function wallet({ last_txs, ...wallet }: GetAddress.Response, txs: Array<RawTransaction>): Wallet {
    return Object.assign(
      walletMeta(),
      wallet,
      {
        transactions: normalize.transactions(wallet.balance, txs),
        totalTransactions: txs.length
      }
    )
  }
}


type Error = {
  error: string,
  [key: string]: any
}
function isError(r: any): r is Error {
  return r.hasOwnProperty('error')
}

class PeercoinExplorer {
  explorerUrl = 'https://explorer.peercoin.net'
  apiRequest<T = any>(call: ApiCalls.Coind, query: object, errorMessage = `PeercoinExplorer.ext.${call} request returned empty`){
    return getJSON<T | Error>(`${this.explorerUrl}/api/${call}?${stringifyQuery(query)}`, errorMessage)
  }
  extendedRequest<T = any>(call: ApiCalls.Extended, param: string, errorMessage = `PeercoinExplorer.ext.${call} request returned empty`){
    return getJSON<T | Error>(`${this.explorerUrl}/ext/${[ call, param ].join('/')}`, errorMessage)
  }
  getBalance = async (address: string) => {
    let balance = await this.extendedRequest('getbalance', address)
    return Number(balance)
  }

  listUnspent = async (address: string) => {
    let { unspent_outputs } = await this.extendedRequest('listunspent', address)
    return unspent_outputs
  }

  getRawTransaciton = (txid: string) => this.apiRequest<RawTransaction>('getrawtransaction', { txid, decrypt: 1 })
  sendRawTransaciton({ value, ...utxo }: RawTransaction.UTXO){
    let hex: string = (new bitcore.Transaction({ amount: value, ...utxo })).toString()
    return this.apiRequest<any>('sendrawtransaction', { hex })
  }

  transactionInfo = (id: string) => this.extendedRequest('txinfo', id)
  getAddress = (address: string) => this.extendedRequest<GetAddress.Response>('getaddress', address)

  wallet = async (address: string) => {
    let resp = await this.getAddress(address)
    if(isError(resp)){
      if(resp.error === "address not found."){
        return Wallet.empty()
      }
      throw Error(resp.error)
    } else {
      let transactions = await Promise.all(
        resp.last_txs.map(txn => this.getRawTransaciton(txn.addresses))
      )
      // TODO retry sync, background sync? redux-offline?
      return normalize.wallet(resp, transactions.filter(t => !isError(t)) as Array<RawTransaction>)
    }
  }

} 

export default new PeercoinExplorer()
