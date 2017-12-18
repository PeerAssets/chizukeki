import { fork, all, put, takeLatest, call } from 'redux-saga/effects'

import fetchJSONRoutine from '../store/fetch-routine'

function unspent({ address, network = 'ppc-test' }){
  return `https://chainz.cryptoid.info/${network}/api.dws?q=unspent&key=7547f94398e3&active=${address}`
}

async function syncTransactions({ address }) {
  let response = await fetch( unspent({ address }) )
  let { unspent_outputs } = await response.json()
  return unspent_outputs
}

function balance(unspentOutputs){
  return unspentOutputs.reduce((sum, output) => 
    sum + (Number(output.value) || 0), 0
  ) / 100000000.0
}

async function fetchJSON(payload){
  const unspentOutputs = await syncTransactions(payload)
  return { unspentOutputs, balance: balance(unspentOutputs) }
}

const { routine, sync, trigger } = fetchJSONRoutine<
  'FETCH_TRANSACTIONS',
  { trigger: { address: string } }
>({
  actionPrefix: 'FETCH_TRANSACTIONS',
  fetchJSON,
  triggers: [ 'LOAD_PRIVATE_KEY' ]
})

export default trigger

export { routine }
