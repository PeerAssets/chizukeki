import bitcore from '../../lib/bitcore'
import { getJSON, stringifyQuery, Satoshis, Wallet, walletMeta } from './common'

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

namespace Unspent {
  export type Output = {
    tx_hash: string,
    script: string,
    // TODO [[explorer.peercoin]] correct and normalize output
    tx_ouput_n: number,
    value: Satoshis,
  }
}
type Unspent = {
  unspent_outputs: Array<Unspent.Output>
}

namespace RawTransaction {
  export type UTXO = {
    value: number,
    n: number,
    scriptPubKey: any
  }
  export type ToSend = {
    unspentOutputs: Array<Wallet.UTXO>,
    toAddress: string,
    amount: number,
    changeAddress: string,
    privateKey: string,
    fee?: number
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

  export const satoshis = Satoshis.toAmount

  export function unspentOutput({ tx_hash, script, tx_ouput_n, value }: Unspent.Output): Wallet.UTXO {
    return {
      txid: tx_hash,
      scriptPubKey: script,
      vout: tx_ouput_n,
      amount: satoshis(value)
    }
  }

  export function transactions(balance: number, txs: Array<RawTransaction>){
    let nTransactions: Array<Wallet.Transaction> = []
    for (let raw of txs){
      let { txid: id, confirmations, time, vout } = raw
      let amount = vout.reduce((a, { value }) => a + value, 0)
      nTransactions.push({
        id,
        confirmations,
        amount,
        balance,
        timestamp: new Date(time * 1000),
        raw
      })
      balance -= amount
    }
    return nTransactions
  }

  export function wallet({ last_txs, ...wallet }: GetAddress.Response, txs: Array<RawTransaction>, unspentOutputs: Array<Wallet.UTXO>): Wallet {
    return Object.assign(
      walletMeta(),
      wallet,
      {
        transactions: normalize.transactions(wallet.balance, txs),
        totalTransactions: txs.length,
        unspentOutputs
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
async function throwing<T>(p: Promise<Error | T>){
  let r = await p
  if(isError(r)){
    throw Error(r.error)
  }
  return r
}

async function defaultOnError<T>(p: Promise<T>, def: T){
  try {
    return p
  } catch {
    return def
  }
}

class PeercoinExplorer {
  explorerUrl = 'https://explorer.peercoin.net'
  apiRequest<T = any>(call: ApiCalls.Coind, query: object, errorMessage = `PeercoinExplorer.api.${call} request returned empty`){
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
    let { unspent_outputs } = await throwing(this.extendedRequest<Unspent>('listunspent', address))
    return unspent_outputs.map(normalize.unspentOutput)
  }

  getRawTransaciton = (txid: string) => this.apiRequest<RawTransaction>('getrawtransaction', { txid, decrypt: 1 })
  sendRawTransaciton({ unspentOutputs, toAddress, amount, changeAddress, privateKey, fee = 0.01 }: RawTransaction.ToSend){
    let signature = new bitcore.PrivateKey(privateKey)
    let transaction = new bitcore.Transaction()
      .from(unspentOutputs)
      .to(toAddress, Satoshis.fromAmount(amount))
      .change(changeAddress)
      .fee(Satoshis.fromAmount(fee))
    debugger;
    let hex = transaction.sign(signature).serialize()
    console.log(hex)
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
      let unspent = await defaultOnError(this.listUnspent(address), [])
      // TODO retry sync, background sync? redux-offline?
      return normalize.wallet(resp, transactions.filter(t => !isError(t)) as Array<RawTransaction>, unspent)
    }
  }

} 

export default new PeercoinExplorer()
