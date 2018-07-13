import { SagaIterator } from 'redux-saga'
import { select, fork, all, put, call, takeLatest } from 'redux-saga/effects'
import fetchJSONRoutine, { interval } from '../generics/fetch-routine'
import { peercoin, Wallet } from '../explorer'
import bitcore from '../lib/bitcore'

import { getTransactionMap } from '../wallet/selectors'

import papi, { Deck, CardTransfer } from './papi'

import { Satoshis } from '../lib/utils'
import Summary from './Summary'
import SendAsset from './SendAsset'
import SpawnDeck from './SpawnDeck'
import CardTransferList from './CardTransfer'

import { mergeByShortId } from './utils'

function pendingCardTransfers(
  sender: string,
  txid: string,
  deck_id: string,
  deck_name: string,
  amountsMap: SendAsset.Payload['amountsMap']
): CardTransferList.Pending {
  return Object.keys(amountsMap).map(receiver => ({
    txid,
    deck_id,
    deck_name,
    receiver,
    sender,
    amount: -amountsMap[receiver],
  }))
}

const sendAssets = fetchJSONRoutine<
  SendAsset.Payload,
  Wallet.PendingTransaction & { _cardTransfers: CardTransferList.Pending },
  Error
>({
  type: 'SEND_ASSETS',
  fetchJSON: async ({ wallet: { address, unspentOutputs, privateKey }, amountsMap, deck }) => {
    let deckSpawnTxn = new bitcore.Transaction(deck.spawnTransaction.hex)
    let transaction = bitcore.assets.createCardTransferTransaction(
      unspentOutputs.map(Satoshis.toBitcoreUtxo),
      address,
      amountsMap,
      deckSpawnTxn
    )
    let fee = transaction.getFee()
    let { minTagFee: amount } = bitcore.assets.configuration
    let signature = new bitcore.PrivateKey(privateKey)
    // setting fee explicitly might be unneeded
    let hex = transaction.fee(fee).sign(signature).serialize()
    let sent = await peercoin._sendRawTransaction(hex)
    return {
      assetAction: 'CardTransfer',
      amount,
      fee: Satoshis.toAmount(fee),
      addresses: [bitcore.assets.assetTag(deckSpawnTxn).toString(), ...Object.keys(amountsMap)],
      ...sent,

      // used by asset reducer, excluded by wallet reducer
      _cardTransfers: pendingCardTransfers(
        address,
        sent.id,
        deck.id,
        deck.name,
        amountsMap
      )
    }
  }
})

/*
  export type Asset = {
    _canLoadMoreCards?: boolean,
    _pending?: boolean,
    balance: Balance,
    deck: Papi.Deck,
    cardTransfers: CardTransferList.Data
    pendingCardTransfers: CardTransferList.Pending
  }
*/

type PendingAsset = Summary.Asset & { _pending: true }

function pendingAsset(deck: Deck.Summary): PendingAsset {
  return {
    _pending: true,
    balance: {
      type: 'UNISSUED'
    },
    deck,
    pendingCardTransfers: [],
    cardTransfers: [],
  }
}

const spawnDeck = fetchJSONRoutine<
  SpawnDeck.Payload,
  Wallet.PendingTransaction & { _pendingAsset: PendingAsset },
  Error
>({
  type: 'SPAWN_DECK',
  fetchJSON: async ({ wallet: { address, unspentOutputs, privateKey }, name, precision, issueMode }) => {
    let transaction = bitcore.assets.createDeckSpawnTransaction(
      unspentOutputs.map(Satoshis.toBitcoreUtxo),
      address,
      name,
      precision,
      issueMode
    )
    let fee = transaction.getFee()
    let { minTagFee: amount } = bitcore.assets.configuration
    let signature = new bitcore.PrivateKey(privateKey)
    // setting fee explicitly might be unneeded
    let hex = transaction.fee(fee).sign(signature).serialize()
    let sent = await peercoin._sendRawTransaction(hex)
    return {
      assetAction: 'DeckSpawn',
      amount,
      addresses: [ bitcore.assets.configuration.deckSpawnTagHash ],
      fee: Satoshis.toAmount(fee),
      ...sent,
      _pendingAsset: pendingAsset({
        name,
        issueMode,
        id: sent.id,
        issuer: address,
        decimals: precision,
        subscribed: false,
      })
    }
  }
})

function* syncCards(address: string, deck_id?: string, currentlyLoaded?: number) {
  let cards = yield call(papi.cards, address, deck_id, currentlyLoaded)
  let transactionMap = yield select(getTransactionMap, cards.map(c => c.txid))
  for (let card of cards) {
    card.transaction = transactionMap[card.txid]
    if(!card.transaction) {
      card.transaction = yield call(peercoin.getRelativeTransaction, card.txid, address)
    }
  }
  return cards as Array<CardTransfer>
}

const syncAsset = fetchJSONRoutine.withPolling<
  { asset: Summary.Asset, address: string },
  Summary.Asset,
  Error
>({
  type: 'SYNC_ASSET',
  fetchJSON: function* ({ asset, address }): SagaIterator {
    let [ deck, balance = {}, cardTransfers ] = yield all([
      call(papi.deckDetails, asset.deck, asset.deck.issuer === address ? address : undefined),
      call(papi.balance, address, asset.deck.id),
      call(syncCards, address, asset.deck.id)
    ])
    // todo page length should be config. If we don't have a full page, we have all the cards.
    let _canLoadMoreCards = cardTransfers.length === 10
    balance.type = (balance.value === undefined) ?
      'UNISSUED' :
      (balance.value > 0 ? 'RECEIVED' : 'ISSUED')
    cardTransfers = cardTransfers.map(t => (
      t.deck_name = deck.name,
      t
    ))
    console.log(balance)
    return { deck, balance, cardTransfers, _canLoadMoreCards } as Summary.Asset
  },
  pollingInterval: interval({ seconds: 30 })
})

/*
 * grab balances
 * grab all decks that start with a balance short_id OR are issued by the user
 * merge (TODO request sorting from restless?)
 * TODO: pass in most recent block height and only sync from there
*/
const syncAssets = fetchJSONRoutine.withPolling<
  { address: string },
  { assets: Array<Summary.Asset> },
  Error
>({
  type: 'SYNC_ASSETS',
  // todo doesn't handle pending spawned decks
  fetchJSON: function* ({ address }): SagaIterator {
    let rawBalances: Array<any> = yield call(papi.balances, address)
    rawBalances = mergeByShortId(rawBalances)
    let [ decks, cards ] = yield all([
      call(papi.deckSummaries, address, rawBalances.map(b => b.short_id)),
      call(syncCards, address)
    ])
    // todo page length should be config. If we don't have a full page, we have all the cards.
    let _canLoadMoreCards = cards.length === 10
    let unissued: Array<Summary.Asset> = []
    let deckIdMap = decks.reduce((map, deck) => {
      if(deck.issuer === address){
        unissued.push({
          deck,
          balance: { type: 'UNISSUED' },
          cardTransfers: [],
          pendingCardTransfers: []
        })
      }
      map[deck.id.substr(0, 10)] = deck
      return map
    }, {})
    let assets: Array<Summary.Asset> = rawBalances.map(
      ({ short_id, ...balance }) => {
        let deck = deckIdMap[short_id]
        balance.type = (deck.issuer === address) ? 'ISSUED' : 'RECEIVED'
        unissued = unissued.filter(i => i.deck.id !== deck.id)
        let cardTransfers = deck ? cards
            .filter(c => c.deck_id === deck.id)
            .map(c => {
              c.deck_name = deck.name
              return c
            }) :
          []
        return { deck, balance, cardTransfers, pendingCardTransfers: [] } as Summary.Asset
      }).filter(a => a.deck)
    assets = unissued.concat(assets)
    // we can know if more cards for an asset _can't_ be loaded here, but not if they _can_
    if (_canLoadMoreCards === false) {
      assets = assets.map(a => (a._canLoadMoreCards = false, a))
    }
    return { assets }
  },
  pollingInterval: interval({ seconds: 30 })
})

const loadMoreCards = fetchJSONRoutine<
  { address: string, deckId?: string, currentlyLoaded: number },
  { cardTransfers: Summary.Asset['cardTransfers'], deckId?: string },
  Error
>({
  type: 'LOAD_MORE_CARDS',
  // todo doesn't handle pending spawned decks
  fetchJSON: function* ({ address, deckId, currentlyLoaded }): SagaIterator {
    let cardTransfers = yield call(syncCards, address, deckId, currentlyLoaded)
    return { cardTransfers, deckId }
  }
})

function* cleanup(){
  yield takeLatest('HARD_LOGOUT', () => (
    put(syncAssets.routine.stop()),
    put(syncAsset.routine.stop())
  ))
}

// TODO cleanup copypasta
export default function * (){
  yield all([
    syncAssets.trigger(),
    syncAssets.poll(),

    syncAsset.trigger(),
    syncAsset.poll(),

    sendAssets.trigger(),
    spawnDeck.trigger(),
    loadMoreCards.trigger(),

    cleanup()
  ])
}


export { syncAssets, sendAssets, syncAsset, spawnDeck, loadMoreCards }
