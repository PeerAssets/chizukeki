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
  console.log({ unspentOutputs })
  return { unspentOutputs, balance: balance(unspentOutputs) }
}

const { routine, fetchSaga: sync, trigger } = fetchJSONRoutine<
  { privateKey: string, address: string },
  { unspentOutputs: Array<any>, balance: number },
  Error
>({
  type: 'FETCH_TRANSACTIONS',
  fetchJSON,
})

export default trigger

export { routine, sync }
