import { AnyAction } from 'typescript-fsa';
import ActionHistory from '../generics/action-history'

import Saga, { syncDecks, getDeckDetails, syncBalances, sendAssets, spawnDeck } from './saga'
import { Deck } from './papi'
import Assets from './Assets'

export type State = Assets.Data & ActionHistory.Bind

let actionHistory = () => ActionHistory.of(syncDecks.routine.allTypes)

function handleSync(
  old: Array<Deck>,
  synced: Array<Deck>
){
  let oldMap = old.reduce((m, o) => Object.assign(m, { [o.id]: o }), {})
  return synced.map(s => Object.assign({}, oldMap[s.id] || {}, s))
}

function logout({ decks }: State){
  return { decks: null, balances: null, ...actionHistory() }
}


function assetReducer(state: State = { decks: null, balances: null, ...actionHistory() }, action: AnyAction): State {
  return syncDecks.routine.switch<State>(action, {
    started: payload => state,
    done: (payload) => ({
      ...state,
      decks: state.decks ? handleSync(state.decks, payload) : payload
    }),
    failed: () => state
  }) ||
  getDeckDetails.routine.switch<State>(action, {
    started: payload => state,
    done: (payload) => ({
      ...state,
      decks: (state.decks || <Array<Deck>>[]).map(deck => deck.id === payload.id ? payload : deck)
    }),
    failed: () => state
  }) ||
  syncBalances.routine.switch<State>(action, {
    started: payload => state,
    done: ({ balances }) => ({
      ...state,
      balances
    }),
    failed: () => state
  }) ||
  ((action.type === 'HARD_LOGOUT') ? logout(state) : state)
}

export const reducer = ActionHistory.bind<string, State>(assetReducer)
export const saga = Saga
export const routines = {
  syncDecks: syncDecks.routine,
  getDeckDetails: getDeckDetails.routine,
  syncBalances: syncBalances.routine,
  sendAssets: sendAssets.routine,
  spawnDeck: spawnDeck.routine
}
