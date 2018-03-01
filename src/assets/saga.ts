import { fork, all, put, call, takeLatest } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin, Wallet } from '../explorer'
import bitcore from '../lib/bitcore'
import papi, { Deck } from './papi'

import { Satoshis } from '../lib/utils'
import Summary from './Summary'
import SendAsset from './SendAsset'
import SpawnDeck from './SpawnDeck'

const syncDecks = fetchJSONRoutine.withPolling<
  {},
  Array<Deck.Summary>,
  Error
>({
  type: 'SYNC_DECK_LIST',
  fetchJSON: async () => papi.decks(),
  pollingInterval: 5 * 60 * 1000, // poll every 5 minutes
})

const getDeckDetails = fetchJSONRoutine<
  { deck: Deck.Summary, address: string },
  Deck.Full,
  Error
>({
  type: 'GET_DECK_DETAILS',
  fetchJSON: ({ deck, address }: { deck: Deck.Summary, address?: string }) => 
    papi.deckDetails(deck, deck.issuer === address ? address : undefined)
})

const sendAssets = fetchJSONRoutine<
  SendAsset.Payload,
  Wallet.PendingTransaction,
  Error
>({
  type: 'SEND_ASSETS',
  fetchJSON: async ({ wallet: { address, unspentOutputs, privateKey }, amountsMap, deckSpawn }) => {
    let transaction = bitcore.assets.createCardTransferTransaction(
      unspentOutputs.map(Satoshis.toBitcoreUtxo),
      address,
      amountsMap,
      new bitcore.Transaction(deckSpawn.hex)
    )
    let { minTagFee: amount, txnFee: fee } = bitcore.assets.configuration
    let signature = new bitcore.PrivateKey(privateKey)
    let hex = transaction.sign(signature).serialize()
    let sent = await peercoin._sendRawTransaction(hex)
    return {
      amount,
      fee,
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
      fee,
      ...sent
    }
  }
})

const syncBalances = fetchJSONRoutine.withPolling<
  { address: string, decks: Array<Deck> },
  { balances: Array<Summary.Balance> },
  Error
>({
  type: 'SYNC_ASSET_BALANCES',
  fetchJSON: async ({ address, decks }) => {
    let rawBalances: Array<any> = await papi.balances(address)
    let unissued: Array<Summary.Balance> = []
    let deckIdMap = decks.reduce((map, deck) => {
      if(deck.issuer === address){
        unissued.push({ deck, type: 'UNISSUED' })
      }
      map[deck.id.substr(0, 10)] = deck
      return map
    }, {})
    let balances = rawBalances.map(
      ({ short_id, ...balance }) => {
        balance.type = balance.value > 0 ? 'RECIEVED' : 'ISSUED'
        balance.deck = deckIdMap[short_id]
        unissued = unissued.filter(i => i.deck.id !== balance.deck.id)
        return balance as Summary.Balance
      })
    return { balances: unissued.concat(balances) }
  },
  pollingInterval: 1 * 60 * 1000, // poll every 1 minutes
})

const syncAsset = fetchJSONRoutine.withPolling<
  { asset: Summary.Balance, address: string },
  Summary.Balance,
  Error
>({
  type: 'SYNC_ASSET',
  fetchJSON: async ({ asset, address }) => {
    let [ deck, balance = asset ] = await Promise.all([
      papi.deckDetails(asset.deck, asset.deck.issuer === address ? address : undefined),
      papi.balance(address, asset.deck.id)
    ])
    balance.deck = deck
    balance.type = (balance.value === undefined) ?
      'UNISSUED' :
      (balance.value > 0 ? 'RECIEVED' : 'ISSUED')
    return balance as Summary.Balance
  },
  pollingInterval: 1 * 60 * 1000, // poll every 1 minutes
})

// TODO cleanup copypasta
export default function * (){
  yield all([
    syncDecks.trigger(),
    getDeckDetails.trigger(),
    syncBalances.trigger(),
    sendAssets.trigger(),
    syncAsset.trigger(),
    spawnDeck.trigger()
  ])
}


export { syncDecks, getDeckDetails, syncBalances, sendAssets, syncAsset, spawnDeck }
