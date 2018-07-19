import * as React from 'react'
import { View, Clipboard } from 'react-native'
import PrivateKey from './LoadPrivateKey'
import { Button,  Body, Text, Icon } from 'native-base'
import Modal from '../generics/modal/modal'
import { WrapActionable } from './UnlockModal'

let styles = {
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  column: {
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    margin: 7.5,
    flex: 1,
  }
}

type Keys = Keys.Locked | Keys.Unlocked
namespace Keys {
  type WithFormat = {
    format: PrivateKey.Data['format'],
  }
  export type Locked = WithFormat & { locked: string }
  export type Unlocked = WithFormat & { private: string }
  export function areLocked(keys: Keys): keys is Locked {
    return keys.hasOwnProperty('locked')
  }
}

class UnlockThenCopy extends React.Component<{ keys: Keys }, { privateKey: string, alerting: boolean }> {
  state = { privateKey: '', alerting: false }
  cache = (privateKey: string) => this.setState({ privateKey })
  copy = () => {
    let keys = this.props.keys
    let privateKey = Keys.areLocked(keys) ? 
      this.state.privateKey :
      keys.private
    let success = Clipboard.setString(PrivateKey.toString(privateKey, keys.format))
    this.setState({ privateKey: '' })
    this.setState({ alerting: true })
    setTimeout(() => {
      this.setState({ alerting: false })
    }, 2500)
    return success
  }
  render() {
    let alerting = this.state.alerting
    return [
      <Modal key='modal' open={Boolean(this.state.privateKey)} onClose={() => this.setState({ privateKey: '' })}>
        <Body style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 175 }}>
          <Text> Unlocked! </Text>
          <Button styleNames='iconLeft success' style={{ ...styles.column, maxHeight: 50 }} onPress={this.copy}>
            <Text> Copy Key to Clipboard </Text>
          </Button>
        </Body>
      </Modal>,
      <WrapActionable.IfLocked
        key='button'
        keys={this.props.keys}
        actionProp='onPress'
        action={Keys.areLocked(this.props.keys) ? this.cache : this.copy}
        Component={alerting ? 
          ({ onPress }) => (
            <Button styleNames='iconLeft success' style={styles.column}
                onPress={() => this.setState({ alerting: false })}>
              <Icon name='check' />
              <Text>Key Copied!</Text>
            </Button>
          ) :
          ({ onPress }) => (
            <Button styleNames='iconLeft light' style={styles.column} onPress={onPress}>
              <Icon name='eject' />
              <Text>Export Key</Text>
            </Button>
          )
        }
      />
    ]
  }
}

export { UnlockThenCopy }

export default Keys