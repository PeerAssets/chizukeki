import ActionHistory from '../generics/action-history'
import Saga, { syncDecks, getDeckDetails } from './saga'
import { Deck } from './papi'
import { AnyAction } from 'typescript-fsa';

export type State = { decks: Array<Deck> } & ActionHistory.Bind

let actionHistory = () => ActionHistory.of(syncDecks.routine.allTypes)

function handleSync(
  old: State['decks'],
  synced: State['decks']
){
  let oldMap = old.reduce((m, o) => Object.assign(m, { [o.id]: o }), {})
  return synced.map(s => Object.assign({}, oldMap[s.id] || {}, s))
}

function assetReducer(state: State = { decks: [], ...actionHistory() }, action: AnyAction): State {
  return syncDecks.routine.switch<State>(action, {
    started: payload => state,
    done: (payload) => ({
      ...state,
      decks: handleSync(state.decks, payload)
    }),
    failed: () => state
  }) ||
  getDeckDetails.routine.switch<State>(action, {
    started: payload => state,
    done: (payload) => ({
      ...state,
      decks: state.decks.map(deck => deck.id === payload.id ? payload : deck)
    }),
    failed: () => state
  }) ||
  state
}

export const reducer = ActionHistory.bind(assetReducer)
export const saga = Saga
export const routines = {
  syncDecks: syncDecks.routine,
  getDeckDetails: getDeckDetails.routine
}