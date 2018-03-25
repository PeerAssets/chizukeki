import { AnyAction } from 'typescript-fsa';
import { trackRoutineStages } from '../generics/utils'

import saga, { syncAssets, sendAssets, spawnDeck, syncAsset } from './saga'
import { Deck } from './papi'
import Assets from './Assets'

const routines = {
  syncAssets: syncAssets.routine,
  sendAssets: sendAssets.routine,
  syncAsset: syncAsset.routine,
  spawnDeck: spawnDeck.routine
}

type Stages = { routineStages: { [key in keyof typeof routines]: string | undefined } }

export type State = Assets.Data & Stages

let initialState = () => ({
  assets: null,
  routineStages: {
    syncDecks: undefined,
    getDeckDetails: undefined,
    syncAssets: undefined,
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

function logout({}: State){
  return initialState()
}


function assetsReducer(state: State = initialState(), action: AnyAction): State {
  return syncAssets.routine.switch<State>(action, {
    started: payload => state,
    done: ({ assets }) => ({
      ...state,
      assets
    }),
    stopped: () => state,
    failed: () => state
  }) ||
  syncAsset.routine.switch<State>(action, {
    started: payload => state,
    done: (asset) => ({
      ...state,
      assets: (state.assets ? state.assets.map(a =>
        a.deck.id === asset.deck.id ? asset : a) : [ asset ])
    }),
    stopped: () => state,
    failed: () => state
  }) ||
  ((action.type === 'HARD_LOGOUT') ? logout(state) : state)
}

export const reducer = trackRoutineStages(routines, 'routineStages')(assetsReducer)
export { saga, routines }
