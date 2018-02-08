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

namespace Deck {
  export type Summary = {
    id: string
    name: string
    issuer: string
    issueMode: string
    precision: number
    subscribed: boolean
  }
  export type Full = Summary & {
    supply: number
    balances: { [address: string]: number }
  }
}

type Deck = Deck.Summary | Deck.Full

class Papi {
  explorerUrl = 'http://172.104.159.149:5555/api/v1'
  apiRequest<T = any>(call: ApiCalls, ...path){
    return getJSON<T>(`${this.explorerUrl}/${ call }/${ path.join('/') }`)
  }
  decks = async (): Promise<Array<Deck.Summary>> => {
    let decks = await this.apiRequest('decks')
    return decks.map(({ issue_mode, ...rest }) => ({ issueMode: issue_mode, ...rest }))
  }
  deckDetails = async (deck: Deck.Summary): Promise<Deck.Full> => {
    let balances = await this.apiRequest('decks', deck.id)
    let supply = Object.values(balances).reduce((sum, balance) => sum + balance, 0)
    return Object.assign({}, deck, { balances, supply })
  }
} 

export { Deck }

export default new Papi()
