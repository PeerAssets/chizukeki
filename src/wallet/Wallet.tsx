import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'

namespace Wallet {
  export type Transaction = {
    script: string,
    tx_hash: string,
    tx_output_n: number,
    value: number,
  }
  export type unspentOutputs = {
    unspentOutputs: Array<Transaction>
  }
  export type Data = PrivateKey.Data & unspentOutputs
}

export default Wallet
