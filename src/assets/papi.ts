import configure from '../configure'

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
    precision: number
    subscribed: boolean
    spawnTransaction?: any
  }
  export type Full = Summary & {
    supply: number
    balances: { [address: string]: number }
  }
}

type Deck = Deck.Summary | Deck.Full

class Papi {
  explorerUrl =  /**/ 'http://localhost:5555' /*/ 'http://172.104.159.149:5555' /**/
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
  deckDetails = async (deck: Deck.Summary): Promise<Deck.Full> => {
    let balances = await this.apiRequest<{ [address: string]: number }>('decks', deck.id)
    let supply = Object.values(balances).reduce((sum, balance) => sum + balance, 0)
    return Object.assign({}, deck, { balances, supply })
  }
  balances = async (address: string) => {
    let filters = [{ name: "account", "op": "like", "val": `${address}%`}]
    let { objects: balances } = await this.restlessRequest('balances', { filters, results_per_page: 100 })
    return balances
  }
} 

export { Deck }

export default new Papi()
