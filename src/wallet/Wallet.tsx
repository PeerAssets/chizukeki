import * as React from 'react'
import { Dimensions, View, Text } from 'react-native';
import { Button, RkCard } from 'react-native-ui-kitten';
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


let RkView = (View as any)

function Wallet({ address, unspentOutputs = [] }: Partial<Wallet.Data>) {
  return (
    <RkCard>
      <RkView rkCardHeader>
        <Text>Address {address}</Text>
      </RkView>
      <RkView rkCardContent>
        { unspentOutputs.map((utxo, i) => <Text key={i}>{JSON.stringify(utxo)}</Text>) }
      </RkView>
      <RkView rkCardFooter>
        <Text>Footer</Text>
      </RkView>
    </RkCard>
  )
}

export default Wallet
