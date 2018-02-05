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

import Wrapper from '../generics/Wrapper'
import RoutineButton from '../generics/routine-button'
import bitcore from '../lib/bitcore'

namespace LoadPrivateKey {
  export type Data = {
    privateKey: string,
    address: string,
    format: Format,
    password: string | undefined
  }
}

type Format = 'hd' | 'wif' | 'raw'

const formatText = {
  hd: 'HD Key',
  raw: 'Private Key',
  wif: 'WIF',
}

let choiceStyle = {
  height: '100%',
  paddingLeft: 5,
  paddingRight: 5,
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
        <Text style={{ paddingLeft: 10, paddingRight: 10 }}>{children}</Text>
      </Button>
    )
  }
  return (
    <Segment>
      <Choice first format='hd' selected={selected}>HD</Choice>
      <Choice format='wif' selected={selected}>Wif</Choice>
      <Choice last format='raw' selected={selected}>Raw</Choice>
    </Segment>
  )
}

function normalize(
  { privateKey, format }: Pick<LoadPrivateKey.Data, 'privateKey' | 'format'>
): Pick<LoadPrivateKey.Data, 'privateKey' | 'format' | 'address'> {
  switch (format) {
    case 'wif':
      let pKey = bitcore.PrivateKey.fromWIF(privateKey)
      return {
        format,
        privateKey: pKey.toString(),
        address: pKey.toAddress().toString(),
      }
    case 'raw':
      pKey = new bitcore.PrivateKey(privateKey)
      return {
        format,
        privateKey: pKey.toString(),
        address: pKey.toAddress().toString(),
      }
    case 'hd':
      pKey = new bitcore.HDPrivateKey(privateKey)
      return {
        format,
        privateKey: pKey.toString(),
        address: pKey.privateKey.toAddress().toString(),
      }
  }
}

class LoadPrivateKey extends React.Component<
  {
    syncStage?: string | undefined,
    loadPrivateKey: (data: LoadPrivateKey.Data) => void
  }, {
    data: LoadPrivateKey.Data,
    error: Error | undefined
  }
  > {
  state = {
    error: undefined,
    data: {
      privateKey: '',
      address: '',
      format: 'raw' as Format,
      password: undefined,
    }
  }
  processState = ({
    privateKey = this.state.data.privateKey,
    format = this.state.data.format
  }: { privateKey?: string, format?: Format }) => {
    let data = this.state.data
    try {
      this.setState({
        data: Object.assign(data, normalize({ privateKey, format })),
        error: undefined
      })
    } catch (error) {
      this.setState({ error, data: Object.assign(data, { privateKey, format }) })
    }
  }
  setPassword = (password: string) => {
    this.setState({
      data: Object.assign(this.state.data, { password }),
    })
  }
  render() {
    let { privateKey, format, password } = this.state.data
    return (
      <Wrapper>
        <Card >
          <CardItem header>
            <Body style={[styles.row, { paddingLeft: 0, paddingRight: 0 }]}>
              <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Import or Generate Private Key</H2>
              <Button info
                style={styles.right}
                onPress={() => this.processState({ privateKey: new bitcore.HDPrivateKey().toString(), format: 'hd' })}>
                <Text>Generate HD Key</Text>
              </Button>
            </Body>
          </CardItem>
          <CardItem>
            <Body style={styles.row}>
              <Item style={{ minWidth: 300 }}>
                <Icon active name='key' />
                <Input
                  placeholder={`Paste ${formatText[format]} here or Generate a new one`}
                  style={{ fontSize: 12, lineHeight: 14, textOverflow: 'ellipsis' }}
                  value={privateKey}
                  onChangeText={privateKey => this.processState({ privateKey })} />
              </Item>
              <SelectFormat
                selected={format}
                select={format => this.processState({ format })}
                style={styles.right} />
            </Body>
          </CardItem>
          <CardItem footer>
            <Body style={styles.row}>
              <Item style={{ minWidth: 300 }}>
                <Icon active name='lock' />
                <Input
                  placeholder={'add a password'}
                  secureTextEntry
                  style={{ fontSize: 12, lineHeight: 14, textOverflow: 'ellipsis' }}
                  value={password || ''}
                  onChangeText={this.setPassword} />
              </Item>
              <RoutineButton
                style={[styles.right, { minWidth: 161 }]}
                disabled={(!privateKey) || this.state.error}
                onPress={() => this.props.loadPrivateKey(this.state.data)}
                stage={this.props.syncStage}
                DEFAULT='Import and Sync'
                STARTED='Syncing wallet'
                DONE='Successfully synced!'
                FAILED='There was a Problem syncing!' />
            </Body>
          </CardItem>
        </Card>
      </Wrapper>
    )
  }
}

const styles = {
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    flexWrap: 'wrap',
    paddingLeft: 30,
    paddingRight: 30
  },
  right: {
    alignSelf: 'flex-end',
    justifyContent: 'center'
  }
}

export default LoadPrivateKey