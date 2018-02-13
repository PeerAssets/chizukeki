import * as React from 'react'
import { View } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base/src/index'

import Send from './SendAsset'
import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import Modal from '../generics/modal.web'

type AssetData = {
  shortName: string,
  balance: number,

}

function Balance({ balance, asset, ...props }) {
  return (
    <View {...props}>
      <H2>{balance.toLocaleString('en')} {asset}</H2>
      <Text styleNames='note'>balance</Text>
    </View>
  )
}

let styles = {
  main: {
    flex: 3,
    minWidth: 325,
    marginTop: -5,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 7.5,
    flex: 1,
  }
}

@connectStyle('PeerKeeper.Asset', styles)
class Asset extends React.Component<
  {
    style?: any,
    send: Send.Props
  }
> {
  componentDidMount() {
    let sync = this.props.sync
    if(sync.enabled){
      sync.start()
    }
  }
  render() {
    let { send, style } = this.props
    return (
      <Wrapper>
        <View style={style.main}>
          <Card style={{ width: '100%' }}>
            <CardItem styleNames='header'>
              <Balance balance={balance} style={style.column} />
            </CardItem>
            <CardItem>
              <Body style={style.body}>
              </Body>
            </CardItem>
          </Card>
          <Send {...send} />
        </View>
      </Wrapper>
    )
  }
}
