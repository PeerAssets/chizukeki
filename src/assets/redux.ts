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
  // TODO page length should be a config
  let _canLoadMoreCards = cardTransfers.length === 10
  if(deckId){
    return assets.map(a => a.deck.id !== deckId ? a : {
      ...a,
      cardTransfers: mergeCards(
        a.cardTransfers,
        cardTransfers.map(withName(a))
      ),
      _canLoadMoreCards
    })
  } else if (_canLoadMoreCards === false) {
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

function mergePendingCards(
  assets: Array<Summary.Asset>,
  pendingCards: Array<CardTransfer.Pending> = [],
): Array<Summary.Asset> {
  if (pendingCards.length === 0){
    return assets
  }
  return [...assets.map(asset => asset.deck.id === pendingCards[0].deck_id
    ? Object.assign({}, asset, {
      pendingCardTransfers: [...pendingCards, ...asset.pendingCardTransfers]
    })
    : asset
  )]
}

function mergeAsset(old: Summary.Asset, { cardTransfers, ...synced }: Summary.Asset) {
  let syncedIds = cardTransfers.map(t => t.txid)
  let pendingCardTransfers = old.pendingCardTransfers.filter(t => !syncedIds.includes(t.txid))
  return {
    ...old,
    ...synced,
    pendingCardTransfers,
    cardTransfers: mergeCards(
      old.cardTransfers,
      cardTransfers.map(withName(old))
    )
  }
}
function mergeAssets(old: Array<Summary.Asset>, synced: Array<Summary.Asset>) {
  let syncedIds = synced.map(a => a.deck.id)
  return old.filter(a => !syncedIds.includes(a.deck.id)) // this is prep for "cache spawned"
    .concat(synced.map(s => {
      // merge synced with current if relevent 
      let o = old.filter(o => o.deck.id === s.deck.id)
      return o.length ?
        mergeAsset(o[0], s) : 
        s
    }))
}

function assetsReducer(state: State = initialState(), action: AnyAction): State {
  return syncAssets.routine.switch<State>(action, {
    started: payload => state,
    done: ({ assets }) => ({
      ...state,
      assets: state.assets ? mergeAssets(state.assets, assets): assets
    }),
    stopped: () => state,
    failed: () => state
  }) ||
  syncAsset.routine.switch<State>(action, {
    started: payload => state,
    done: (asset) => ({
      ...state,
      assets: (state.assets ? state.assets.map(a =>
        a.deck.id === asset.deck.id ? mergeAsset(a, asset) : a
      ) : [ asset ])
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
  sendAssets.routine.switch<State>(action, {
    started: payload => state,
    done: ({ _cardTransfers: pending }) => ({
      ...state,
      assets: state.assets ? mergePendingCards(state.assets, pending) : null
    }),
    failed: () => state
  }) ||
  ((action.type === 'HARD_LOGOUT') ? logout(state) : state)
}

export const reducer = trackRoutineStages(routines, 'routineStages')(assetsReducer)
export { saga, routines }
