import { fork, all, put, call, take } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin } from '../explorer'
import papi, { Deck } from './papi'

function getSpawnIfOwned(address: string){
  return async (deck: Deck.Summary) => {
    if (deck.issuer === address) {
      let spawnTransaction = await peercoin.getRelativeRawTransaction
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
  { balances: Array<any> },
  Error
>({
  type: 'SYNC_ASSET_BALANCES',
  fetchJSON: async ({ address, decks }) => {
    let balances: Array<any> = await papi.balances(address)
    let deckIdMap = decks.reduce((map, deck) => (
      map[deck.id.substr(0, 10)] = deck, map
    ), {})
    balances.map(({ value, short_id, ...balance }) => (
      balance.deck = deckIdMap[short_id],
      balance
    ))
    return { balances }
  },
})

// TODO cleanup copypasta
export default function * (){
  yield all([
    syncDecks.trigger(),
    getDeckDetails.trigger(),
    sendAssets.trigger()
  ])
}


export { syncDecks, getDeckDetails, syncBalances, sendAssets,  }
