import { fork, all, put, call, takeLatest } from 'redux-saga/effects'
import fetchJSONRoutine from '../generics/fetch-routine'
import { peercoin, Wallet } from '../explorer'
import bitcore from '../lib/bitcore'
import papi, { Deck } from './papi'

import { Satoshis } from '../lib/utils'
import Summary from './Summary'
import SendAsset from './SendAsset'
import SpawnDeck from './SpawnDeck'

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


function mergeByShortId(balances: Array<any>){
  return Object.values(
    balances.reduce((shortIdMap, { short_id, ...balance }) => {
      let { _raw = [], value = 0 } = shortIdMap[short_id] || {}
      shortIdMap[short_id] = {
        short_id,
        value: value + balance.value,
        _raw: [ ..._raw, balance ]
      }
      return shortIdMap
    },
    <Record<string, any>>{
    })
  )
}


const syncAsset = fetchJSONRoutine.withPolling<
  { asset: Summary.Asset, address: string },
  Summary.Asset,
  Error
>({
  type: 'SYNC_ASSET',
  fetchJSON: async ({ asset, address }) => {
    let [ deck, balance = asset.balance ] = await Promise.all([
      papi.deckDetails(asset.deck, asset.deck.issuer === address ? address : undefined),
      papi.balance(address, asset.deck.id)
    ])
    balance.type = (balance.value === undefined) ?
      'UNISSUED' :
      (balance.value > 0 ? 'RECEIVED' : 'ISSUED')
    return { deck, balance } as Summary.Asset
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
  fetchJSON: async ({ address }) => {
    let rawBalances: Array<any> = await papi.balances(address)
    rawBalances = mergeByShortId(rawBalances)
    let decks: Array<Deck.Summary> = await papi.deckSummaries(address, rawBalances.map(b => b.short_id))
    let unissued: Array<Summary.Asset> = []
    let deckIdMap = decks.reduce((map, deck) => {
      if(deck.issuer === address){
        unissued.push({ deck, balance: { type: 'UNISSUED' } })
      }
      map[deck.id.substr(0, 10)] = deck
      return map
    }, {})
    let assets = rawBalances.map(
      ({ short_id, ...balance }) => {
        balance.type = balance.value > 0 ? 'RECEIVED' : 'ISSUED'
        let deck = deckIdMap[short_id]
        unissued = unissued.filter(i => i.deck.id !== deck.id)
        return { deck, balance } as Summary.Asset
      })
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
