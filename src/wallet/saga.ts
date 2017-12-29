import { fork, all, put, takeLatest, call } from 'redux-saga/effects'

import fetchJSONRoutine from '../store/fetch-routine'
import cryptoid from '../api/cryptoid'

function balance(unspentOutputs){
  return unspentOutputs.reduce((sum, output) => 
    sum + (Number(output.value) || 0), 0
  ) / 100000000.0
}

async function fetchJSON({ address }){
  const unspentOutputs = await cryptoid.listUnspent(address)
  return { unspentOutputs, balance: balance(unspentOutputs) }
}

const { routine, sync, trigger } = fetchJSONRoutine<
  'FETCH_TRANSACTIONS',
  { trigger: { privateKey: string, address: string, } }
>({
  actionPrefix: 'FETCH_TRANSACTIONS',
  fetchJSON,
  triggers: [ 'LOAD_PRIVATE_KEY' ]
})

export default trigger

export { routine, sync }
