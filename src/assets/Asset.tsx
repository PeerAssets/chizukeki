import * as React from 'react'
import { View } from 'react-native'
import { Button, CardItem, Body, Text, Card, connectStyle, H2, H3, Icon, Badge } from 'native-base'

import Wrapper from '../generics/Wrapper'
import SyncButton from '../generics/sync-button'
import Modal from '../generics/modal.web'

import Summary from './AssetSummary'
import SendAsset from './SendAsset'

import { Deck } from './papi'

import CardTransferList from './CardTransfer'

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
class Asset extends React.Component<Asset.Props, {}> {
  componentDidMount(){

  }
  render() {
    let { asset, sync, wallet, actions: { send }, sendAssetsStage } = this.props
    return (
      <Wrapper>
        <View style={styles.main as any}>
          <Card styleNames='asset summary' style={{ width: '100%', padding: 10 }}>
            <Summary asset={asset} sync={sync} />
          </Card>
            {'balance' in asset &&
              <SendAsset key='send' {...{ asset, wallet, send, stage: sendAssetsStage }} />
            }
        </View>
        { ('cardTransfers' in asset) &&
          <CardTransferList style={{ width: '100%' }} cardTransfers={asset.cardTransfers} />
        }
      </Wrapper>
    )
  }
}

namespace Asset {
  export type Props = {
    asset: Summary.Asset | { deck: Deck }
    sync: SyncButton.Logic
    sendAssetsStage: string | undefined
    actions: {
      send: SendAsset.Props['send']
    }
    wallet: SendAsset.Props['wallet']
    style?: any
  }
}

export default Asset
