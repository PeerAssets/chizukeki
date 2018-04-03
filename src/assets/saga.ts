import { SagaIterator } from 'redux-saga'
import { select, fork, all, put, call, takeLatest } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin, Wallet } from '../explorer'
import bitcore from '../lib/bitcore'

import { getTransactionMap } from '../wallet/selectors'

import papi, { Deck, CardTransfer } from './papi'

import { Satoshis } from '../lib/utils'
import Summary from './Summary'
import SendAsset from './SendAsset'
import SpawnDeck from './SpawnDeck'

import { mergeByShortId } from './utils'

const sendAssets = fetchJSONRoutine<
  SendAsset.Payload,
  Wallet.PendingTransaction,
  Error
>({
  type: 'SEND_ASSETS',
  fetchJSON: async ({ wallet: { address, unspentOutputs, privateKey }, amountsMap, deckSpawn }) => {
    let deckSpawnTxn = new bitcore.Transaction(deckSpawn.hex)
    let transaction = bitcore.assets.createCardTransferTransaction(
      unspentOutputs.map(Satoshis.toBitcoreUtxo),
      address,
      amountsMap,
      deckSpawnTxn
    )
    let { minTagFee: amount, txnFee: fee } = bitcore.assets.configuration
    let signature = new bitcore.PrivateKey(privateKey)
    let hex = transaction.sign(signature).serialize()
    let sent = await peercoin._sendRawTransaction(hex)
    return {
      amount,
      fee,
      addresses: [bitcore.assets.assetTag(deckSpawnTxn), ...Object.keys(amountsMap)],
      ...sent
    }
  }
})

const spawnDeck = fetchJSONRoutine<
  SpawnDeck.Payload,
  Wallet.PendingTransaction,
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
    let { minTagFee: amount, txnFee: fee } = bitcore.assets.configuration
    let signature = new bitcore.PrivateKey(privateKey)
    let hex = transaction.sign(signature).serialize()
    let sent = await peercoin._sendRawTransaction(hex)
    return {
      amount,
      addresses: [ bitcore.assets.configuration.deckSpawnTagHash ],
      fee,
      ...sent
    }
  }
})

function* syncCards(address: string, deck_id?: string) {
  let cards = yield call(papi.cards, address, deck_id)
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
    let [ deck, balance, cardTransfers ] = yield all([
      call(papi.deckDetails, asset.deck, asset.deck.issuer === address ? address : undefined),
      call(papi.balance, address, asset.deck.id),
      call(syncCards, address, asset.deck.id)
    ])
    balance.type = (balance.value === undefined) ?
      'UNISSUED' :
      (balance.value > 0 ? 'RECEIVED' : 'ISSUED')
    cardTransfers = cardTransfers.map(t => (
      t.deck_name = deck.name,
      t
    ))
    return { deck, balance, cardTransfers } as Summary.Asset
  },
  pollingInterval: 1 * 60 * 1000, // poll every 1 minutes
})

/*
 * grab balances
 * grab all decks that start with a balance short_id OR are issued by the user
 * merge (request sorting from restless?)
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
    let unissued: Array<Summary.Asset> = []
    let deckIdMap = decks.reduce((map, deck) => {
      if(deck.issuer === address){
        unissued.push({ deck, balance: { type: 'UNISSUED' }, cardTransfers: [] })
      }
      map[deck.id.substr(0, 10)] = deck
      return map
    }, {})
    let assets: Array<Summary.Asset> = rawBalances.map(
      ({ short_id, ...balance }) => {
        let deck = deckIdMap[short_id]
        if(deck){
          balance.type = (deck.issuer === address) ? 'ISSUED' : 'RECEIVED'
          unissued = unissued.filter(i => i.deck.id !== deck.id)
        }
        let cardTransfers = deck ? cards
            .filter(c => c.deck_id === deck.id)
            .map(c => {
              c.deck_name = deck.name
              return c
            }) :
          []
        return { deck, balance, cardTransfers } as Summary.Asset
      }).filter(a => a.deck)
    return { assets: unissued.concat(assets) }
  },
  pollingInterval: 1 * 60 * 1000, // poll every 1 minutes
})


// TODO cleanup copypasta
export default function * (){
  yield all([
    syncAssets.trigger(),
    sendAssets.trigger(),
    syncAsset.trigger(),
    spawnDeck.trigger()
  ])
}


export { syncAssets, sendAssets, syncAsset, spawnDeck }
