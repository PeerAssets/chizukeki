import { getJSON, stringifyQuery, Satoshis, Wallet, walletMeta } from './common'

namespace ApiCalls {
  export type Public =
    | 'getblockcount'
    | 'getdifficulty'
    | 'getreceivedbyaddress'

  export type Private =
    | 'getbalance'
    | 'unspent'
    | 'multiaddr'
}
type ApiCalls = ApiCalls.Public | ApiCalls.Private

namespace MultiAddress {
  export type Transaction = {
    hash: string,
    confirmations: number,
    change: number,
    time_utc: string,
    n?: number
  }
  export type Response = {
    addresses: [{
      address: string,
      total_sent: number,
      total_received: number,
      final_balance: number,
      n_tx: number
    }]
    txs: Array<Transaction>
  }
}

namespace normalize {
  export function transactions(balance: number, txs: Array<MultiAddress.Transaction>) {
    let nTransactions: Array<Wallet.Transaction> = []
    for (let i = 0; i < txs.length; i++) {
      let {
        hash: id,
        confirmations,
        change,
        time_utc,
        n = 1,
      } = txs[i]
      // consume subsequent transaction segments if n > 1
      while (n-- > 1) {
        i++
        change += txs[i].change
      }
      let amount = Satoshis.toAmount(change)
      nTransactions.push({
        id,
        confirmations,
        amount,
        balance,
        timestamp: new Date(time_utc),
      })
      balance -= amount
    }
    return nTransactions
  }
  export function wallet({
      addresses: [{
        total_received = 0,
        total_sent = 0,
        final_balance = 0,
        n_tx: totalTransactions = 0
      } = {}],
        txs
    }: MultiAddress.Response, unspentOutputs: Array<Wallet.UTXO>): Wallet {
    let [received, sent, balance] = [
      total_received, total_sent, final_balance
    ].map(Satoshis.toAmount)
    return {
      ...walletMeta(),
      unspentOutputs,
      balance,
      received,
      sent,
      totalTransactions,
      transactions: normalize.transactions(balance, txs)
    }
  }

}



class Cryptoid {
  explorerUrl = 'https://chainz.cryptoid.info'
  constructor(private key: string = '7547f94398e3', private network: string = 'ppc-test') { }
  apiRequest<T = any>(call: ApiCalls, query: object){
    let { explorerUrl, network } = this
    return getJSON<T>(`${explorerUrl}/${network}/api.dws?q=${call}&${stringifyQuery(query)}`)
  }
  private publicApiRequest = async (call: ApiCalls.Public, query: object) =>
    this.apiRequest(call, query)
  privateApiRequest<T = any>(call: ApiCalls.Private, query: object){
    return this.apiRequest<T>(call, { key: this.key, ...query })
  }

  getBalance = async (address: string) => {
    let balance = await this.privateApiRequest('getbalance', { a: address })
    return Number(balance)
  }

  listUnspent = async (address: string) => {
    let { unspent_outputs } = await this.privateApiRequest<{ unspent_outputs: Array<Wallet.UTXO> }>('unspent', { active: address })
    return unspent_outputs
  }

  getReceivedByAddress = async (address: string) => {
    let amount = await this.publicApiRequest('getreceivedbyaddress', { a: address })
    return Number(amount)
  }

  wallet = async (address: string) => {
    let resp = await this.privateApiRequest('multiaddr', { active: address })
    let unspent = await this.listUnspent(address)
    if (resp) {
      return normalize.wallet(resp as MultiAddress.Response, unspent)
    } else {
      throw Error('could not sync with cryptoid')
    }
  }

  /* NOTE: block requests won't work because cryptoid doesn't have cors enabled on these endpoints
  
  private blockRequest = (call, query: object & { id: string }) => {
    let { explorerUrl, network } = this
    return getJSON(`${explorerUrl}/explorer/${call}.dws?coin=${network}&${params(query)}`)
  }

  getRawTransaction = async (txid: string, hex?: boolean) => {
    let query = hex ? { hex, id: txid } : { id: txid }
    let resp = await this.blockRequest('tx.raw', query)
    return hex ? resp.hex : resp
  }

  listTransactions = async (address: string) => {
    let resp = await this.blockRequest('address.summary', { id: address })
    if(resp){
      return resp.tx.map(([_0, txid, _2, _3, value, balance]) =>
        ({ balance, value, id: txid.toLowerCase() }))
    }
  }

  summary = async (address: string) => {
    type AddressSummary = {
      tx: Array<[any, string, any, any, number, number]>,
      received: number,
      sent: number,
      balance: number
      [rest: string]: any
    }

    let resp = await this.blockRequest('address.summary', { id: address })
    if(resp){
      // unused fields: block, stake, stakenb, stakeIn, stakeOut receivednb, sentnb
      let { tx = [], received = '0', sent = '0', balance = '0' }: AddressSummary = resp;
      [received, sent, balance] = [received, sent, balance].map(normalizeSatoshis)
      let transactions = tx.map(([_0, txid, _2, _3, value, balance]) =>
        ({ balance, value, id: txid.toLowerCase() }))
      let wallet: Wallet = { received, sent, balance, transactions }
      return wallet
    } else {
      throw Error('could not sync with cryptoid')
    }
  }
  / * TODO block requests don't work without cors */

}

export default new Cryptoid()
