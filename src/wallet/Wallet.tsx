import * as React from 'react'
import { Dimensions, View, Text } from 'react-native'
import { Button, RkCard, RkText } from 'react-native-ui-kitten'
import PrivateKey from './LoadPrivateKey'

namespace Wallet {
  export type Transaction = {
    script: string,
    tx_hash: string,
    tx_output_n: number,
    value: number,
  }
  export type Transactions = {
    unspentOutputs: Array<Transaction>,
    balance: number
  }
  export type Data = PrivateKey.Data & Transactions
}

let RkView = (View as any)

function Wallet({ address, balance = 0 }: Partial<Wallet.Data>) {
  console.log({balance})
  return (
    <RkCard>
      <RkView rkCardHeader>
        <RkText rkType='header2 inverseColor'>Address: {address}</RkText>
      </RkView>
      <RkView rkCardContent>
        <RkText rkType='header2 inverseColor'>${ balance.toString() }</RkText>
      </RkView>
      <RkView rkCardFooter>
      </RkView>
    </RkCard>
  )
}


export default Wallet
