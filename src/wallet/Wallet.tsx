import { Dimensions, Text, View } from 'react-native';
import PrivateKey from './LoadPrivateKey'

namespace Wallet {
  export type Transaction = {
    script: string,
    tx_hash: string,
    tx_output_n: number,
    value: number,
  }
  export type Data = PrivateKey.Data & {
    unspent_outputs: Array<Transaction>
  }
}

export default Wallet
