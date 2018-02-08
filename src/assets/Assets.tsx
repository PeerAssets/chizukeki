import * as React from 'react'
import { Dimensions, View, ViewStyle, Clipboard } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, Icon } from 'native-base/src/index'

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import Modal from '../generics/modal.web'

import DeckList from './DeckList'
export default DeckList

/*
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

@connectStyle('PeerKeeper.Assets', styles)
class Assets extends React.Component<
  Assets.Data & {
    style?: any,
  }
> {
  render() {
    let { address, transactions = [], balance = 0, style, keys, sync, sendTransaction } = this.props
    return (
      <Wrapper>
        <View style={style.main}>
          <Card style={{ width: '100%' }}>
            <CardItem header>
              <Balance balance={balance} style={style.column} />
            </CardItem>
            <CardItem>
              <Body style={style.body}>
                <RoutineButton style={style.column}
                  dismiss={[{ stage: 'DONE', auto: true, onPressDismiss: sync.enabled ? sync.stop : sync.start }]}
                  icons={{ DEFAULT: 'refresh', DONE: 'refresh' }}
                  warning={!sync.enabled}
                  onPress={sync.enabled ? sync.stop : sync.start}
                  stage={sync.stage}
                  DEFAULT={ sync.enabled ? 'Syncing' : 'Sync Disabled' }
                  LOADING='Syncing'
                  FAILED='Sync Failed' />
              </Body>
            </CardItem>
          </Card>
          <SendTransaction {...sendTransaction} />
        </View>
        <DeckList transactions={transactions} />
      </Wrapper>
    )
  }
}

namespace Assets {
  export type Data = {}
}

export default Assets
*/