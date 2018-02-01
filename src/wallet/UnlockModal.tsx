import * as React from 'react'
import Modal from 'react-native-simple-modal'
import { Text, Body, Input, Button, Item, Label } from 'native-base/src/index'

import { unlockKey } from '../lib/keygen'


import Wallet from './Wallet'

class UnlockModal extends React.Component<{
  unlock: (password: string) => void,
  close: () => void,
  open: boolean
}, {
  password: string
}>{
  state = { password: '' }
  render() {
    let { unlock, close, open } = this.props
    return (
      <Modal
        open={false}
        offset={0}
        overlayBackground={'rgba(0, 0, 0, 0.75)'}
        animationDuration={200}
        animationTension={40}
        modalDidOpen={() => undefined}
        modalDidClose={() => undefined}
        closeOnTouchOutside={true}
        containerStyle={{
          justifyContent: 'center'
        }}
        modalStyle={{
          borderRadius: 2,
          margin: 20,
          padding: 10,
          backgroundColor: '#F5F5F5'
        }}
        disableOnBackPress={false}>
        <Body style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
          <Item fixedLabel style={{ marginLeft: 15, minWidth: 300 }}>
            <Label>Password</Label>
            <Input
              clearTextOnFocus
              secureTextEntry
              placeholder='password'
              style={{ lineHeight: 14, }}
              value={this.state.password}
              onChangeText={password => this.setState({ password })} />
          </Item>
          <Button info
            onPress={() => unlock(this.state.password)}>
            <Text>Unlock</Text>
          </Button>
          <Button danger
            onPress={() => (this.setState({ password: '' }), close())}>
            <Text>Cancel</Text>
          </Button>
        </Body>
      </Modal>
    )
  }
}

class WrapActionable extends React.Component<WrapActionable.Props, {
  open: boolean,
}>{
  state = { open: false }
  unlock = async (password: string) => {
    let { action, lockedKey } = this.props
    this.setState({ open: false })
    let privateKey = await unlockKey(lockedKey, password) 
    return action(privateKey)
  }
  render() {
    let { Component, action, actionProp } = this.props
    return [
      <Component {...{ [actionProp]: () => this.setState({ open: true })} } />,
      <UnlockModal
        unlock={this.unlock}
        open={this.state.open}
        close={() => this.setState({ open: false })} />
    ]
  }
}

namespace WrapActionable {
  export type Props = {
    action: (privateKey: string) => any,
    lockedKey: string,
    actionProp: string,
    Component: React.ComponentClass<any> | React.StatelessComponent<any> | (<P>(p: P) => React.ReactElement<P>)
  }
  export function IfLocked({ keys, Component, ...props }:
    Pick<Props, 'action' | 'actionProp' | 'Component'> & { keys: Wallet.Keys } ){
    return !Wallet.Keys.areLocked(keys) ? 
        <Component {...{
          [props.actionProp]: () => (!Wallet.Keys.areLocked(keys)) && props.action(keys.private)
          }}/> :
      <WrapActionable
        lockedKey={keys.locked}
        Component={Component}
        {...props} />
  }
}

export { WrapActionable }

export default UnlockModal