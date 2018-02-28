import bitcore from '../lib/bitcore'
import { HTTP, Satoshis } from '../lib/utils'
import configure from '../configure'

import { Wallet, walletMeta } from './common'

let { getJSON, getText, stringifyQuery } = HTTP

window['bitcore'] = bitcore


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
    scriptPubKey: {
      addresses: Array<string>,
      asm: string,
      hex: string,
      reqSigs: number,
      type: string,
    }
  }
  export type ToSend = {
    unspentOutputs: Array<Wallet.UTXO>,
    toAddress: string,
    amount: number,
    changeAddress: string,
    privateKey: string,
    fee?: number
  }
  export type Relative = RawTransaction & { type: 'CREDIT' | 'DEBIT', fee: number, inputTotal: number }
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
    address: string,
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
    balance: string,
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
      amount: Satoshis.btc.toAmount(value)
    }
  }

  // todo converting to/from satoshis to avoid precision errors is inefficient 
  export function transactions({ address, balance }: Wallet, txs: Array<RawTransaction.Relative>){
    let nTransactions: Array<Wallet.Transaction> = []
    for (let raw of txs.reverse()){
      let { txid: id, confirmations, time, vout, type, inputTotal, fee } = raw
      let amount = type === 'CREDIT' ? 0 : -Satoshis.fromAmount(inputTotal - fee)
      for (let out of vout){
        if(out.scriptPubKey.addresses && out.scriptPubKey.addresses.includes(address)){
          amount += Satoshis.fromAmount(out.value)
        }
      }
      nTransactions.push({
        id,
        confirmations,
        amount: Satoshis.toAmount(amount),
        fee,
        balance,
        timestamp: new Date(time * 1000),
        raw
      })
      balance -= Satoshis.toAmount(amount)
    }
    return nTransactions
  }

  export function wallet(
    { last_txs, balance, ...rest }: GetAddress.Response,
    txs: Array<RawTransaction.Relative>,
    unspentOutputs: Array<Wallet.UTXO>
  ): Wallet {
    let wallet: Wallet = Object.assign(
      walletMeta(),
      rest,
      {
        balance: Number(balance),
        transactions: [],
        totalTransactions: txs.length,
        unspentOutputs 
      }
    )
    wallet.transactions = normalize.transactions(wallet, txs)
    return wallet
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
  explorerUrl = `https://explorer.peercoin.net${ configure.fromEnv().NETWORK === 'TESTNET' ? ':8000' : '' }`
  rawApiRequest(call: ApiCalls.Coind, query: object){
    return getText(`${this.explorerUrl}/api/${call}?${stringifyQuery(query)}`)
  }
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

  getRawTransaction = (txid: string) => this.apiRequest<RawTransaction>('getrawtransaction', { txid, decrypt: 1 })

  _sendRawTransaction = async (hex):
    Promise<Pick<Wallet.PendingTransaction, 'id' | 'timestamp' | 'raw'>> =>
  {
    let response = await this.rawApiRequest('sendrawtransaction', { hex })
    if (response === 'There was an error. Check your console.'){
      throw Error('Invalid Transaction')
    }
    let { outputs, inputs, ...raw }: {
      hash: string, outputs: Array<any>, inputs: Array<any>
    } = bitcore.Transaction(hex).toObject()
    // TODO need to update available unspent transactions after send locally?
    return {
      id: raw.hash,
      timestamp: new Date(),
      raw: { vout: outputs, vin: inputs, ...raw }
    }
  }

  sendRawTransaction = async (
    { unspentOutputs, toAddress, amount, changeAddress, privateKey, fee = 0.01, }: RawTransaction.ToSend
  ): Promise<Wallet.PendingTransaction> => {
    let signature = new bitcore.PrivateKey(privateKey)
    let transaction = new bitcore.Transaction()
      .from(unspentOutputs.map(Satoshis.toBitcoreUtxo))
      .to(toAddress, Satoshis.fromAmount(amount))
      .change(changeAddress)
      .fee(Satoshis.fromAmount(fee))
    debugger
    // TODO need to update available unspent transactions after send locally?
    let sent = await this._sendRawTransaction(transaction.sign(signature).serialize())
    return {
      amount,
      fee,
      ...sent
    }
  }

  transactionInfo = (id: string) => this.extendedRequest('txinfo', id)
  getAddress = (address: string) => this.extendedRequest<GetAddress.Response>('getaddress', address)

  getRelativeRawTransaction = async (id: string, address?: string) => {
    let [raw, info] = await Promise.all([
      this.getRawTransaction(id),
      this.transactionInfo(id),
    ])
    let type: 'CREDIT' | 'DEBIT' | 'UNINVOLVED' = (!address) ?
      'UNINVOLVED' : (
      info.inputs.filter(i => i.addresses === address).length ?
        'DEBIT' :
        'CREDIT'
      )
    let inputTotal = info.inputs.reduce((total, i) => total + Satoshis.btc.toAmount(i.amount), 0)
    let fee = inputTotal - Satoshis.btc.toAmount(info.total)
    return Object.assign(raw, { type, fee, inputTotal })
  }

  wallet = async (address: string) => {
    let resp = await this.getAddress(address)
    if(isError(resp)){
      if(resp.error === "address not found."){
        return Wallet.empty(address)
      }
      throw Error(resp.error)
    } else {
      let transactions = await Promise.all(
        resp.last_txs.map(txn => this.getRelativeRawTransaction(txn.addresses, address))
      )
      let unspent = await defaultOnError(this.listUnspent(address), [])
      // TODO retry sync, background sync? redux-offline?
      return normalize.wallet(resp, transactions.filter(t => !isError(t)) as Array<RawTransaction.Relative>, unspent)
    }
  }

} 

export default new PeercoinExplorer()
