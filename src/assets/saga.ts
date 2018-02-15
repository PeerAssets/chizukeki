import { fork, all, put, call, take } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin } from '../explorer'
import papi, { Deck } from './papi'

import Summary from './Summary'

function getSpawnIfOwned(address: string){
  return async (deck: Deck.Summary) => {
    if (deck.issuer === address) {
      let spawnTransaction = await peercoin.getRelativeRawTransaction(deck.id, address)
      deck.spawnTransaction = spawnTransaction
    }
    return deck
  }
}

const syncDecks = fetchJSONRoutine<
  { address: string },
  Array<Deck.Summary>,
  Error
>({
  type: 'SYNC_DECK_LIST',
  fetchJSON: async ({ address }) => {
    let decks = await papi.decks()
    if(address) {
      decks = await Promise.all(decks.map(getSpawnIfOwned(address)))
    }
    return decks
  },
  //pollingInterval: 30 * 60 * 1000, // poll every 30 minutes
})

const getDeckDetails = fetchJSONRoutine<
  Deck.Summary,
  Deck.Full,
  Error
>({
  type: 'GET_DECK_DETAILS',
  fetchJSON: (summary: Deck.Summary) => papi.deckDetails(summary)
})

const sendAssets = fetchJSONRoutine<
  any,
  any,
  Error
>({
  type: 'SEND_ASSETS',
  fetchJSON: async () => ({})
})

const syncBalances = fetchJSONRoutine<
  { address: string, decks: Array<Deck> },
  { balances: Array<Summary.Balance> },
  Error
>({
  type: 'SYNC_ASSET_BALANCES',
  fetchJSON: async ({ address, decks }) => {
    let rawBalances: Array<any> = await papi.balances(address)
    let unissued: Array<Summary.Balance> = []
    let deckIdMap = decks.reduce((map, deck) => {
      if(deck.issuer === address){
        unissued.push({ deck, type: 'UNISSUED' })
      }
      map[deck.id.substr(0, 10)] = deck
      return map
    }, {})
    let balances = unissued.concat(rawBalances.map(
      ({ value, short_id, ...balance }) => (
        balance.type = value > 0 ? 'RECIEVED' : 'ISSUED',
        balance.deck = deckIdMap[short_id],
        unissued = unissued.filter(i => i.deck.id !== balance.deck.id),
        balance as Summary.Balance
      )))
    return { balances }
  },
})

// TODO cleanup copypasta
export default function * (){
  yield all([
    syncDecks.trigger(),
    getDeckDetails.trigger(),
    syncBalances.trigger(),
    sendAssets.trigger()
  ])
}


export { syncDecks, getDeckDetails, syncBalances, sendAssets,  }
