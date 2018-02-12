import * as React from 'react'; import { Component } from 'react';
import { Dimensions, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Badge,
  Container,
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

type Format = 'hd' | 'wif' | 'raw' 
const formatText = {
  hd: 'HD Key',
  raw: 'Private Key',
  wif: 'WIF',
}
function SelectedFormat({ selected, style }: { selected: Format, style: any }) {
  let float = {
    position: 'absolute',
    right: -10,
    top: -10,
  }
  let fontSize = 12
  return (
    <Badge success style={[ float, style ]}>
      <Text style={{ fontSize }}>
        <Icon name='check' style={{ fontSize, color: "#fff", lineHeight: 20 }} /> {formatText[selected]}
      </Text>
    </Badge>
  )
}

function validator(format: Format, toKey: (key: string) => any, toAddress = key => key.toAddress()){
  return (privateKey: string): false | Pick<LoadPrivateKey.Data, 'privateKey' | 'address' | 'format'> => {
    try {
      let pKey = toKey(privateKey)
      return {
        privateKey: pKey.toString() as string,
        address: toAddress(pKey).toString() as string,
        format
      }
    } catch (e) {
      return false
    }
  }
}

function deriveFormat(privateKey: string){
  type D = false | Pick<LoadPrivateKey.Data, 'privateKey' | 'address' | 'format'>
  let data: D = [
    validator('hd', key => new bitcore.HDPrivateKey(key), key => key.privateKey.toAddress()),
    validator('wif', key => bitcore.PrivateKey.fromWIF(key)),
    validator('raw', key => new bitcore.PrivateKey(key)),
  ].reduce(
    (derived: D, derive): D => derived || derive(privateKey) || (false as false),
    (false as D)
  )
  if(!data) {
    return {
      data: {
        privateKey,
        format: undefined,
        address: undefined
      },
      error: 'Could Not parse Key. Must be either HD, WIF, or raw Private Key'
    }
  }
  return { data, error: undefined }
}

class LoadPrivateKey extends React.Component<
  {
    syncStage?: string | undefined,
    loadPrivateKey: (data: LoadPrivateKey.Data, syncNeeded?: boolean) => void
  }, {
    pKeyInput: string,
    data: Partial<LoadPrivateKey.Data>,
    error: string | undefined
  }
  > {
  state = {
    pKeyInput: '',
    error: undefined,
    data: {
      privateKey: '',
      address: '',
      format: undefined,
      password: undefined,
    }
  }
  withData = (data: Partial<LoadPrivateKey.Data>) => 
    Object.assign({}, this.state.data, data)
  withSomeData = (data: Partial<LoadPrivateKey.Data>): Partial<LoadPrivateKey.Data> => 
    Object.assign(this.state.data, data)
  processKeyChange = (key: string) => {
    let { data, error = undefined } = deriveFormat(key)
    this.setState({ data: this.withSomeData(data), error, pKeyInput: key })
  }
  setPassword = (password: string) => {
    this.setState({ data: this.withData({ password }) })
  }
  generateNew = () => this.props.loadPrivateKey(
    this.withData(
      deriveFormat(new bitcore.HDPrivateKey().toString()).data
    ) as LoadPrivateKey.Data,
    false
  )
  render() {
    let { pKeyInput, data, data: { privateKey, format, password } } = this.state
    let load = LoadPrivateKey.isFilled(data) && (
      () => LoadPrivateKey.isFilled(data) && this.props.loadPrivateKey(data)
    )
    return (
      <Wrapper>
        <Card >
          <CardItem styleNames='header'>
            <Body style={[styles.row, { paddingLeft: 0, paddingRight: 0 }]}>
              <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Import or Generate Private Key</H2>
            </Body>
          </CardItem>
          <CardItem>
            <Body style={styles.row}>
              <Item style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Icon styleNames='active' name='key' />
                <Input
                  placeholder={`Paste WIF, HD Key, or Raw Private Key here`}
                  style={{ fontSize: 12, lineHeight: 14, textOverflow: 'ellipsis', minWidth: 200 }}
                  value={pKeyInput}
                  onChangeText={privateKey => this.processKeyChange(privateKey)}/>
                  { format && <SelectedFormat selected={format} style={styles.right} /> }
              </Item>
              <Item style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Icon styleNames='active' name='lock' style={{ width: 32, textAlign: 'center' }} />
                <Input
                  placeholder={'Add a password'}
                  secureTextEntry
                  style={{ fontSize: 12, lineHeight: 14, textOverflow: 'ellipsis' }}
                  value={password || ''}
                  onChangeText={this.setPassword} />
              </Item>
            </Body>
          </CardItem>
          <CardItem styleNames='footer'>
            <Body style={styles.row}>
              <RoutineButton
                style={[{ justifyContent: 'center', width: '100%', paddingBottom: 6 + (26 / 2), borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }]}
                disabled={(!load) || this.state.error}
                onPress={load || (() => {})}
                stage={this.props.syncStage}
                DEFAULT={`Import ${password ? 'Locked' : 'Unlocked'} Key and Sync`}
                STARTED='Syncing wallet'
                DONE='Successfully synced!'
                FAILED='There was a Problem syncing!' />
              <View style={{ zIndex: 2, width: '100%', flexDirection: 'row', justifyContent: 'center', height: 0, overflow: 'visible' }}>
                <Badge styleNames='light' style={{ position: 'absolute', top: -(26 / 2), width: 26, height: 26, flexDirection: 'column', justifyContent: 'center', borderRadius: '50%' }}>
                  <Text style={{ fontSize: 10, whiteSpace: 'nowrap' }}>or</Text>
                </Badge>
              </View>
              <Button
                styleNames='primary'
                style={[{ justifyContent: 'center', width: '100%', paddingTop: 6 + (26 / 2), borderTopRightRadius: 0, borderTopLeftRadius: 0 }]}
                onPress={this.generateNew}>
                <Text>Generate new {password ? 'Locked' : 'Unlocked'} Wallet</Text>
              </Button>
            </Body>
          </CardItem>
        </Card>
      </Wrapper>
    )
  }
}

namespace LoadPrivateKey {
  export type Data = {
    privateKey: string,
    address: string,
    format: Format,
    password: string | undefined
  }
  export function isFilled(d: Partial<Data>): d is Data {
    let { privateKey, format, address } = d
    return Boolean(privateKey && format && address)
  }
  // todo after import WIF is a normal privateKey
  export function toString(privateKey: string, format: Format): string {
    switch(format){
      case 'hd':
        return privateKey
      case 'wif':
      case 'raw':
        return new bitcore.PrivateKey(privateKey).toWIF()
    }
  }
}


const styles = {
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
    paddingLeft: 15,
    paddingRight: 15
  },
  right: {
    alignSelf: 'flex-end',
    justifyContent: 'center'
  }
}

export default LoadPrivateKey