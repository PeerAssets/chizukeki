import configure from '../configure'
import peercoin from '../explorer'

async function getJSON<T = any>(url: string, emptyErrorMessage?: void | string) {
  let response = await fetch(url)
  let body: T = await response.json()
  if (body !== undefined && body !== null) {
    return body
  } else {
    throw Error(emptyErrorMessage || `getJSON('${url}') failed`)
  }
}

type ApiCalls = 'decks'
type Resource = 'decks' | 'cards' | 'balances'

namespace Deck {
  export type Summary = {
    id: string
    name: string
    issuer: string
    issueMode: string
    decimals: number
    subscribed: boolean
  }
  export type Full = Summary & {
    supply: number
    spawnTransaction: any
    balances: { [address: string]: number }
  }
  export function isFull(deck: Deck): deck is Deck.Full {
    return deck.hasOwnProperty('spawnTransaction')
  }
}

type Deck = Deck.Summary | Deck.Full

class Papi {
  explorerUrl =  /*/ 'http://localhost:5555' /*/ 'https://papi.peercoin.net' /**/
  version = 1
  get apiUrl(){
    return `${this.explorerUrl}/api/v${this.version}`
  }
  get restlessUrl(){
    return `${this.explorerUrl}/restless/v${this.version}`
  }
  apiRequest<T = any>(call: ApiCalls, ...path){
    return getJSON<T>(`${this.apiUrl}/${ call }/${ path.join('/') }`)
  }
  restlessRequest<T = any>(resource: Resource, queryOrId: string | object = {}){
    let path = typeof(queryOrId) === 'string' ?
      `/${queryOrId}` :
      `?q=${ JSON.stringify(queryOrId) }`
    return getJSON<T>(`${this.restlessUrl}/${resource}${path}`)
  }
  decks = async (): Promise<Array<Deck.Summary>> => {
    let decks = await this.apiRequest('decks')
    return decks.map(({ issue_mode, ...rest }) => ({ issueMode: issue_mode, ...rest }))
  }
  deckDetails = async (deck: Deck.Summary, address?: string): Promise<Deck.Full> => {
    let [ balances, spawnTransaction ] = await Promise.all([
      this.apiRequest<{ [address: string]: number }>('decks', deck.id, 'balances'),
      peercoin.getRelativeRawTransaction(deck.id, address)
    ]) 
    // TODO casting shouldn't be necessary
    let supply: number = Object.values(balances)
      .reduce((sum: number, balance: number) => sum + balance, 0) as number
    return Object.assign({}, deck, { balances, supply, spawnTransaction })
  }
  balances = async (address: string) => {
    let filters = [{ name: "account", "op": "like", "val": `${address}%`}]
    let { objects: balances } = await this.restlessRequest('balances', { filters, results_per_page: 100 })
    return balances
  }
  balance = async (address: string, assetId: string) => {
    let filters = [
      { name: "account", "op": "like", "val": `${address}%`},
      { name: "short_id", "op": "eq", "val": `${assetId.substring(0,10)}%`}
    ]
    let { objects: balances } = await this.restlessRequest('balances', { filters, results_per_page: 1 })
    return balances[0]
  }
} 

export { Deck }

export default new Papi()
