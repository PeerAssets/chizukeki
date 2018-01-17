import * as React from 'react'; import { Component } from 'react';
import { Dimensions, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Container,
  Segment,
  Header,
  Content,
  Card,
  CardItem,
  Text,
  H2,
  Body,
  Input,
  Button,
  Item,
  Right,
  Icon,
  variables
} from 'native-base/src/index'

import bitcore from '../lib/bitcore'
import Wrapper from './Wrapper'

namespace LoadPrivateKey {
  export type Data = {
    privateKey: string,
    address: string,
  }
}

type Format = 'wif' | 'raw'

let Touchable = (TouchableOpacity as any)

let choiceStyle = {
  height: '100%',
  paddingLeft: 10,
  paddingRight: 10,
  borderColor: variables.segmentBackgroundColor
}
function SelectFormat({ selected, select, style }: { selected: Format, select: (f: Format) => void, style: any }) {
  function Choice({ selected, format, children, style = [], ...props }) {
    return (
      <Button
        active={selected === format}
        onClick={() => select(format)}
        style={[choiceStyle, ...style]}
        {...props}>
        <Text>{children}</Text>
      </Button>
    )
  }
  return (
    <Segment>
      <Choice first format='wif' selected={selected}>Wif</Choice>
      <Choice last format='raw' selected={selected}>Raw</Choice>
    </Segment>
  )
}

type State = Partial<LoadPrivateKey.Data> & { format: Format }

function normalize({ privateKey, format }: State): LoadPrivateKey.Data {
  let pKey = (format === 'wif') ?
    bitcore.PrivateKey.fromWIF(privateKey) :
    new bitcore.PrivateKey(privateKey)
  return {
    privateKey: pKey.toString(),
    address: pKey.toAddress().toString(),
  }
}

// TODO implicit coupling to routine
let buttonText = {
  STARTED: 'Syncing wallet activity',
  DONE: 'Successfully synced!',
  FAILED: 'There was a problem syncing'
}
function RoutineButton({ stage, onPress, ...props }){
  let stageBased = stage === 'DONE'
    ? { success: true }
    : stage === 'FAILED'
    ? { danger: true }
    : { info: true, onPress }
  return (
    <Button {...stageBased } {...props}>
      <ActivityIndicator animating={stage === 'STARTED' }/>
      <Text>{buttonText[stage] || 'Import and Sync'}</Text>
    </Button>
  )
}

class LoadPrivateKey extends React.Component<
  { 
    syncStage?: string | undefined,
    loadPrivateKey: (data: LoadPrivateKey.Data) => void
  },
  State
  > {
  state = {
    privateKey: '',
    address: undefined,
    format: 'raw' as Format
  }
  render() {
    let { privateKey, format } = this.state
    return (
      <Wrapper>
        <Card >
          <CardItem header>
            <Body style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <H2 style={{flexBasis: 200, paddingBottom: 15 }}>Import or Generate Private Key</H2>
              <Button info
                style={styles.selectFormat}
                onPress={() => this.setState({ privateKey: new bitcore.PrivateKey().toString(), format: 'raw' })}>
                <Text>Generate</Text>
              </Button>
            </Body>
          </CardItem>
          <CardItem>
            <Body style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
              <SelectFormat
                selected={format}
                select={format => this.setState({ format })}
                style={styles.selectFormat} />
              <Item style={{ marginLeft: 15, minWidth: 300 }}>
                <Icon active name='lock' />
                <Input
                  placeholder={`Paste ${ format === 'raw' ? 'private' : format } key here or Generate a new one`}
                  style={{ fontSize: 12, lineHeight: 14, textOverflow: 'ellipsis' }}
                  value={this.state.privateKey}
                  onChangeText={privateKey => this.setState({ privateKey })} />
              </Item>
            </Body>
          </CardItem>
          <CardItem footer>
            <Body>
              <RoutineButton stage={this.props.syncStage} block disabled={!this.state.privateKey}
                onPress={() => this.props.loadPrivateKey(normalize(this.state))}/>
            </Body>
          </CardItem>
        </Card>
      </Wrapper>
    )
  }
}

const styles = {
  selectFormat: {
    flex: 1,
  }
}

export default LoadPrivateKey