import * as React from 'react'
import Modal from '../generics/modal/modal'
import { Text, Body, Input, Button, Item, Label } from 'native-base'
import { View } from 'react-native';

import { unlockKey } from '../lib/encrypt-key'

import Wallet from './Wallet'

class UnlockModal extends React.Component<{
  unlock: (password: string) => Promise<any>,
  close: () => void,
  open: boolean
}, {
  password: string,
  error: string | undefined
}>{
  constructor(props){
    super(props)
    this.state = { password: '', error: undefined }
  }
  close = async (something?: any) => {
    this.setState({ password: '', error: undefined })
    this.props.close()
    return something
  }
  incorrect = ({ message }: Error) => {
    this.setState({ error: message })
  }
  render() {
    let { unlock, open } = this.props
    return (
      <Modal open={open} onClose={this.close} >
        <Body style={{ flexDirection: 'column', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
          <Item styleNames='fixedLabel' style={{ minWidth: 300 }}>
            <Label>Password</Label>
            <Input
              clearTextOnFocus
              secureTextEntry
              placeholder='password'
              style={{ lineHeight: 14, }}
              value={this.state.password}
              onChangeText={password => this.setState({ password })} />
          </Item>
          <View style={{ justifyContent: 'center', marginTop: 7.5, marginBottom: 7.5 }}>
            {this.state.error !== undefined ? <Text styleNames='danger'>Unlock failed, please try again</Text> : null }
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', maxWidth: 175 }}>
            <Button styleNames='info' onPress={() => unlock(this.state.password).then(this.close).catch(this.incorrect)}>
              <Text>Unlock</Text>
            </Button>
            <Button styleNames='danger' onPress={this.close}>
              <Text>Cancel</Text>
            </Button>
          </View>
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
    let privateKey = await unlockKey(lockedKey, password) 
    return action(privateKey)
  }
  render() {
    let { Component, action, actionProp, componentProps = {} } = this.props
    return [
      <Component key='component' {...{ ...componentProps, [actionProp]: () => this.setState({ open: true })} } />,
      <UnlockModal key='modal'
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
    componentProps?: any
  }
  export function IfLocked({ keys, Component, ...props }:
    Pick<Props, 'action' | 'actionProp' | 'Component' | 'componentProps'> & { keys: Wallet.Keys } ){
    return !Wallet.Keys.areLocked(keys) ? 
      <Component {...{
        ...(props.componentProps || {}),
        [props.actionProp]: () => (!Wallet.Keys.areLocked(keys)) && props.action(keys.private)
      }} /> :
      <WrapActionable
        lockedKey={keys.locked}
        Component={Component}
        {...props} />
  }
}

export { WrapActionable }

export default UnlockModal
