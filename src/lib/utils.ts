import bitcore from './bitcore'

function arrayify<T>(a: T | Array<T>): Array<T> {
  return Array.isArray(a) ? a : [a]
}

type BtcSatoshies = number
namespace BtcSatoshies  {
  export const inACoin = 1e8
  export function fromAmount(amount: number): BtcSatoshies {
    return Math.floor(amount * inACoin)
  }
  export function toAmount(amountInSatoshis: BtcSatoshies): number {
    return amountInSatoshis / inACoin
  }
}

type Satoshis = number
namespace Satoshis {
  export const btc = BtcSatoshies
  export const inACoin = 1e6
  export function fromAmount(amount: number): Satoshis {
    return Math.floor(amount * inACoin)
  }
  export function toAmount(amountInSatoshis: Satoshis): number {
    return amountInSatoshis / inACoin
  }

  export function toBitcoreUtxo({ amount, ...utxo }: { amount: number } & { [key: string]: any }) {
    return {
      ...utxo,
      satoshis: Satoshis.fromAmount(amount)
    }
  }
}

namespace HTTP {
  export function stringifyQuery(query: object) {
    return Object.keys(query).reduce((q, key) => q ? `${q}&${key}=${query[key]}` : `${key}=${query[key]}`, '')
  }

  export async function getText(url: string) {
    let response = await fetch(url)
    let body = await response.text()
    return body
  }

  export async function getJSON<T = any>(url: string, emptyErrorMessage?: void | string) {
    let response = await fetch(url)
    let body: T = await response.json()
    if (body !== undefined && body !== null) {
      return body
    } else {
      throw Error(emptyErrorMessage || `getJSON('${url}') failed`)
    }
  }
}

namespace Transaction {
  export type UTXO = {
    txid: string,
    scriptPubKey: string,
    vout: number,
    amount: number,
    // unused address, confirmations
  }
  export type Params = {
    unspentOutputs: UTXO | Array<UTXO>,
    toAddress: string,
    amount: number,
    changeAddress: string,
    fee?: number
  }
  export function from({
    unspentOutputs,
    toAddress,
    amount,
    changeAddress,
    fee = 0.01
  }: Transaction.Params) {
    return new bitcore.Transaction()
      .from(arrayify<UTXO>(unspentOutputs).map(Satoshis.toBitcoreUtxo))
      .to(toAddress, Satoshis.fromAmount(amount))
      .change(changeAddress)
      .fee(Satoshis.fromAmount(fee))
  }
}


export { Satoshis, HTTP, Transaction }