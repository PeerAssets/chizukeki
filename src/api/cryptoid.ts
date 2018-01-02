//https://chainz.cryptoid.info/explorer/address.summary.dws?coin=ppc-test&key=7547f94398e3&id=mik8PZjAoAEAaE68mLTGAjkna44fiG6FV2

namespace ApiCalls {
  export type Public = 
    | 'getblockcount'
    | 'getdifficulty'
    | 'getreceivedbyaddress'

  export type Private = 
    | 'getbalance'
    | 'unspent'

  export type All = Public | Private
}

function params(query: object) {
  return Object.keys(query).reduce((q, key) => `${q}&${key}=${query[key]}`, '')
}

class Cryptoid {
  explorerUrl = 'https://chainz.cryptoid.info'
  constructor(private key: string = '7547f94398e3', private network: string = 'ppc-test'){ }
  private blockRequest = async (call, query: object & { id: string }) => {
    let { explorerUrl, network } = this
    let response = await fetch(`${explorerUrl}/explorer/${call}.dws?coin=${network}&${params(query)}`)
    let body = await response.json()
    return body
  }
  private apiRequest = async (call: ApiCalls.All, query: object) => {
    let { explorerUrl, network } = this
    let response = await fetch(`${explorerUrl}/${network}/api.dws?q=${call}&${params(query)}`)
    let body = await response.json()
    return body
  }
  private publicApiRequest = async (call: ApiCalls.Public, query: object) =>
    this.apiRequest(call, query)
  private privateApiRequest = async (call: ApiCalls.Private, query: object) => 
    this.apiRequest(call, { key: this.key, ...query })

  getBalance = async (address: string) => {
    let balance = await this.privateApiRequest('getbalance', { a: address })
    return Number(balance)
  }

  listUnspent = async (address: string) => {
    let { unspent_outputs } = await this.privateApiRequest('unspent', { active: address })
    return unspent_outputs
  }

  getReceivedByAddress = async (address: string) => {
    let amount = await this.publicApiRequest('getreceivedbyaddress', { a: address })
    return Number(amount)
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
} 

export default new Cryptoid()
