import deepmerge from 'deepmerge'
import { AnyAction } from 'typescript-fsa';
import { trackRoutineStages } from '../generics/utils'

import saga, { syncAssets, sendAssets, spawnDeck, syncAsset, loadMoreCards } from './saga'
import { Deck } from './papi'
import Assets from './Assets'
import Summary from './Summary'
import { CardTransfer } from './CardTransfer'

const routines = {
  syncAssets: syncAssets.routine,
  sendAssets: sendAssets.routine,
  syncAsset: syncAsset.routine,
  spawnDeck: spawnDeck.routine,
  loadMoreCards: loadMoreCards.routine
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
    spawnDeck: undefined,
    loadMoreCards: undefined
  }
})

function logout({}: State){
  return initialState()
}

function mergeCards(old: Array<CardTransfer.Data>, synced: Array<CardTransfer.Data>){
  let syncedIds = synced.map(c => c.id)
  return old.filter(c => !syncedIds.includes(c.id)).concat(synced)
}

function withName(asset: Summary.Asset) {
  return (card: CardTransfer.Data) => (
    card.deck_name = asset.deck.name,
    card
  )
}

function mergeLoadedCards(
  assets: Array<Summary.Asset>,
  cardTransfers: Array<CardTransfer.Data>,
  deckId?: string
): Array<Summary.Asset> {
  let _canLoadMoreCards = cardTransfers.length > 0
  if(deckId){
    return assets.map(a => a.deck.id !== deckId ? a : {
      ...a,
      cardTransfers: mergeCards(
        a.cardTransfers,
        cardTransfers.map(withName(a))
      ),
      _canLoadMoreCards
    })
  } else if (!_canLoadMoreCards) {
    return assets.map(a => ({ ...a, _canLoadMoreCards }))
  } else {
    return assets.map(a => ({
      ...a,
      cardTransfers: mergeCards(
        a.cardTransfers,
        cardTransfers
          .filter(c => c.deck_id === a.deck.id)
          .map(withName(a))
      ),
    }))
  }
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
  loadMoreCards.routine.switch<State>(action, {
    started: payload => state,
    done: ({ cardTransfers, deckId }) => ({
      ...state,
      assets: state.assets ? mergeLoadedCards(state.assets, cardTransfers, deckId) : null
    }),
    failed: () => state
  }) ||
  ((action.type === 'HARD_LOGOUT') ? logout(state) : state)
}

export const reducer = trackRoutineStages(routines, 'routineStages')(assetsReducer)
export { saga, routines }
