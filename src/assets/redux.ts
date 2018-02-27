import { AnyAction } from 'typescript-fsa';
import { trackRoutineStages } from '../generics/utils'

import saga, { syncDecks, getDeckDetails, syncBalances, sendAssets, spawnDeck, syncAsset } from './saga'
import { Deck } from './papi'
import Assets from './Assets'

const routines = {
  syncDecks: syncDecks.routine,
  getDeckDetails: getDeckDetails.routine,
  syncBalances: syncBalances.routine,
  sendAssets: sendAssets.routine,
  syncAsset: syncAsset.routine,
  spawnDeck: spawnDeck.routine
}

type Stages = { routineStages: { [key in keyof typeof routines]: string | undefined } }

export type State = Assets.Data & Stages

let initialState = () => ({
  decks: null,
  balances: null,
  routineStages: {
    syncDecks: undefined,
    getDeckDetails: undefined,
    syncBalances: undefined,
    sendAssets: undefined,
    syncAsset: undefined,
    spawnDeck: undefined
  }
})

function handleSync(
  old: Array<Deck>,
  synced: Array<Deck>
){
  let oldMap = old.reduce((m, o) => Object.assign(m, { [o.id]: o }), {})
  return synced.map(s => Object.assign({}, oldMap[s.id] || {}, s))
}

function logout({ decks }: State){
  return { ...initialState(), decks }
}


function assetsReducer(state: State = initialState(), action: AnyAction): State {
  return syncDecks.routine.switch<State>(action, {
    started: payload => state,
    done: (payload) => ({
      ...state,
      decks: state.decks ? handleSync(state.decks, payload) : payload
    }),
    stopped: () => state,
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
    stopped: () => state,
    failed: () => state
  }) ||
  syncAsset.routine.switch<State>(action, {
    started: payload => state,
    done: (balance) => ({
      ...state,
      balances: (state.balances ? state.balances.map(b =>
        b.deck.id === balance.deck.id ? balance : b) : [ balance ])
    }),
    stopped: () => state,
    failed: () => state
  }) ||
  ((action.type === 'HARD_LOGOUT') ? logout(state) : state)
}

export const reducer = trackRoutineStages(routines, 'routineStages')(assetsReducer)
export { saga, routines }