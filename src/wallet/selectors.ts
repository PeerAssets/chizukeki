import { State } from './redux'

export function getTransaction ({ wallet: { wallet } }: { wallet: State }, id: string) {
  return (( wallet && 'transactions' in wallet) &&
    wallet.transactions.filter(t => t.id === id)[0])
}

export function getTransactionMap ({ wallet: { wallet } }: { wallet: State }, ids: string[]) {
  return ( wallet && 'transactions' in wallet) ?
    wallet.transactions.reduce((hash, t) => {
      if(ids.includes(t.id)){
        hash[t.id] = t
      }
      return hash
    }, {}) :
    {}
}