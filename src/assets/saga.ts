import { fork, all, put, call, take } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin } from '../explorer'
import papi, { Deck } from './papi'

const getSpawnTransaction = fetchJSONRoutine<
  Deck.Summary,
  any,
  Error
>({
  type: 'GET_SPAWN_TRANSACTION',
  fetchJSON: ({ id, issuer: address }) => peercoin.getRelativeRawTransaction(id, address)
})


const syncDecks = fetchJSONRoutine<
  {},
  Array<Deck.Summary>,
  Error
>({
  type: 'SYNC_DECK_LIST',
  fetchJSON: () => papi.decks(),
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

// TODO cleanup copypasta
export default function * (){
  yield all([
    syncDecks.trigger(),
    getDeckDetails.trigger(),
  ])
}

export { syncDecks, getDeckDetails }
