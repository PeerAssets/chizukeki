import configure from '../configure'
import peercoin, { Wallet } from '../explorer'
import { HTTP } from '../lib/utils'
import { Omit } from '../generics/utils'

import IssueMode from './issueModes'

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
    issueMode: IssueMode.Encoding
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

export type CardTransfer = {
  type: 'CardBurn' | 'CardIssue' | 'CardTransfer'

  amount: number,
  txid: string,
  id: string,
  deck_id: string,
  deck_name?: string,
  receiver: string,
  sender: string,

  blockseq: number,
  blocknum: number,
  cardseq: number,

  transaction: Wallet.Transaction
}

const bigPage = { results_per_page: 10000 }

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
  restlessRequest<T = any>(resource: Resource, queryOrId: string | object = {}, params: object = {}){
    let path = typeof(queryOrId) === 'string' ?
      `/${queryOrId}` :
      // TODO results_per_page should be dynamic, implement proper paging
      '?' + HTTP.stringifyQuery({
        q: JSON.stringify(queryOrId),
        ...params
      })
    return getJSON<T>(`${this.restlessUrl}/${resource}${path}`)
  }
  deckSummary = async (deckPrefix: string): Promise<Deck.Summary> => {
    let filters = [
      { name: "id", "op": "like", "val": `${deckPrefix}%`}
    ]
    let { objects: decks } = await this.restlessRequest('decks', { filters }, { results_per_page: 1 })
    let { issue_mode, ...deck } = decks[0]
    return { issueMode: issue_mode, ...deck } as Deck.Summary
  }
  deckDetails = async (deck: Deck.Summary, address?: string, transaction?: Wallet.Transaction): Promise<Deck.Full> => {
    type Balances = { [address: string]: number }
    let [ balances, spawnTransaction ] = await Promise.all([
      this.apiRequest<Balances>('decks', deck.id, 'balances'),
      transaction ?
        new Promise(() => transaction) :
        peercoin.getRelativeRawTransaction(deck.id, address)
    ]) 
    // TODO casting shouldn't be necessary
    let supply: number = Object.values(balances)
      .reduce((sum: number, balance: number) => sum + balance, 0) as number
    // checker required casting for no reason out of the blue
    return Object.assign({}, deck, { balances: balances as Balances, supply, spawnTransaction })
  }
  balances = async (address: string) => {
    let filters = [{ name: "account", "op": "like", "val": `${address}%`}]
    let { objects: balances } = await this.restlessRequest('balances', { filters }, bigPage)
    return balances
  }
  balance = async (address: string, assetId: string) => {
    let filters = [
      { name: "account", "op": "like", "val": `${address}%`},
      { name: "short_id", "op": "like", "val": `${assetId.substring(0,10)}%`}
    ]
    let { objects: balances } = await this.restlessRequest('balances', { filters }, { results_per_page: 1 })
    return balances[0]
  }
  deckSummaries = async (address: string, deckPrefixes: Array<string>): Promise<Array<Deck.Summary>> => {
    let filters = [
      { "or": [
        { name: "issuer", "op": "eq", "val": address },
        ...deckPrefixes.map(deckPrefix => ({
          "name": "id",
          "op": "like",
          "val": `${deckPrefix}%`
        }))
      ]}
    ]
    let { objects: decks } = await this.restlessRequest('decks', { filters }, bigPage)
    return decks.map(({ issue_mode, ...rest }) => ({ issueMode: issue_mode, ...rest }))
  }
  cards = async (address: string, deck_id?: string, currentlyLoaded: number = 0): Promise<Array<Omit<CardTransfer, 'transaction'>>> => {
    let results_per_page = 10
    let page = Math.floor(currentlyLoaded / results_per_page) + 1
    let filters: Array<object> = [ 
      { name: "valid", "op": "eq", "val": true },
       {"or": [
        { name: "sender", "op": "like", "val": `${address}%`},
        { name: "receiver", "op": "like", "val": `${address}%`},
      ]}
    ]
    if(deck_id){
      filters.push({ name: "deck_id", "op": "eq", "val": deck_id })
    }
    let { objects: cards } = await this.restlessRequest('cards', { filters }, { results_per_page, page })
    cards = cards.map(({ amount, ctype, ...card }) => {
      return {
        amount: card.receiver.startsWith(address) ? amount : -amount,
        type: ctype,
        ...card,
      }
    })
    return cards
  }
} 

export { Deck }

export default new Papi()
