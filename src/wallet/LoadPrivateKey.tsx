import * as React from 'react';
import { Component } from 'react';
import { TextInput, Dimensions, View, TouchableOpacity, ActivityIndicator } from 'react-native';
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
} from 'native-base'

import Field from '../generics/Field'
import { Wrapper } from '../generics/Layout'
import RoutineButton from '../generics/routine-button'
import bitcore from '../lib/bitcore'

import configure from '../configure'

const generateKey = configure.fromEnv().KEY_GENERATOR === 'SINGLETON' ?
  (): string => new bitcore.PrivateKey().toString() :
  (): string => new bitcore.HDPrivateKey().toString()

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
    <Badge styleNames='success' style={[ float, style ]}>
      <Text style={{ fontSize }}>
        <Icon name='check' style={{ fontSize, color: "#fff", lineHeight: 20 }} /> {formatText[selected]}
      </Text>
    </Badge>
  )
}

function validator(format: Format, toKey: (key: string) => any, toAddress = key => key.toAddress()){
  return (privateKey: string): false | Pick<LoadPrivateKey.Data, 'privateKey' | 'address' | 'format'> => {
    if(!privateKey.length){
      return false
    }
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
    validator('raw', key => new bitcore.PrivateKey(key)),
    validator('wif', key => bitcore.PrivateKey.fromWIF(key)),
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
      error: 'Could Not parse Key. Must be either WIF or raw Private Key' //,HD, 
    }
  }
  return { data, error: undefined }
}

function _isFilled(d: Partial<LoadPrivateKey.Data>): d is LoadPrivateKey.Data {
  let { privateKey, format, address, password } = d
  return Boolean(privateKey && format && address && password)
}

interface LoadPrivateKeyProps {
  syncStage?: string | undefined,
  loadPrivateKey: (data: LoadPrivateKey.Data, syncNeeded?: boolean) => void
}

interface State {
  pKeyInput: string,
  data: Partial < LoadPrivateKey.Data >,
  error: string | undefined
}

class LoadPrivateKey extends React.Component<LoadPrivateKeyProps, State> {
  state: State = {
    pKeyInput: '',
    error: undefined,
    data: {
      privateKey: '',
      address: '',
      format: undefined,
      password: '',
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
      deriveFormat(generateKey()).data
    ) as LoadPrivateKey.Data,
    false
  )
  render() {
    let { pKeyInput, data, data: { privateKey, format, password } } = this.state
    let load = _isFilled(data) && (
      () => _isFilled(data) && this.props.loadPrivateKey(data)
    )
    return (
      <Wrapper>
        <Card >
          <CardItem styleNames='header'>
            <Body style={{...styles.row, paddingLeft: 0, paddingRight: 0 }}>
              <H2 style={{ flexBasis: 200, paddingBottom: 15 }}>Import or Generate Private Key</H2>
            </Body>
          </CardItem>
          <CardItem>
            <Body style={styles.row}>
              <Field style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                { ref => [
                    <Icon key={0} styleNames='active' name='key' />,
                    <Input 
                      key={1}
                      ref={ref}
                      placeholder={`Paste WIF or Raw Private Key here` /*, HD Key,*/ }
                      style={{ fontSize: 12, lineHeight: 14, minWidth: 200 }}
                      value={pKeyInput}
                      onChangeText={privateKey => this.processKeyChange(privateKey)}/>,
                    format && <SelectedFormat key={3} selected={format} style={styles.right} />
                ]}
              </Field>
              <Field style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap' }}>
                { ref => [
                  <Icon key={0} styleNames='active' name='lock' style={{ width: 32, textAlign: 'center' }} />,
                  <Input
                    key={1}
                    ref={ref}
                    placeholder={'Add a password'}
                    secureTextEntry
                    style={{ fontSize: 12, lineHeight: 14 }}
                    value={password}
                    onChangeText={this.setPassword} />
                  ]
                }
              </Field>
            </Body>
          </CardItem>
          <CardItem styleNames='footer'>
            <Body style={styles.row}>
              <RoutineButton
                style={styles.importButton}
                disabled={Boolean((!load) || this.state.error)}
                onPress={load || (() => {})}
                stage={this.props.syncStage}
                DEFAULT='Import Key and Sync'
                STARTED='Syncing wallet'
                DONE='Successfully synced!'
                FAILED='There was a Problem syncing!' />
              <View style={{ zIndex: 2, width: '100%', flexDirection: 'row', justifyContent: 'center', height: 1, overflow: 'visible' }}>
                <Badge styleNames='light' style={styles.validBadge}>
                  <Text numberOfLines={1} ellipsizeMode='clip'
                    style={{ fontSize: 10, display: 'flex' } as any}>or</Text>
                </Badge>
              </View>
              <Button
                styleNames='primary'
                disabled={!password}
                style={styles.generateButton}
                onPress={this.generateNew}>
                <Text>Generate new Wallet</Text>
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
    password: string
  }
  export const isFilled = _isFilled
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
    flexDirection: 'row' as 'row',
    justifyContent: 'space-around' as 'space-around',
    width: '100%',
    flexWrap: 'wrap' as 'wrap',
    paddingLeft: 15,
    paddingRight: 15
  },
  right: {
    alignSelf: 'flex-end' as 'flex-end',
    justifyContent: 'center' as 'center'
  },
  importButton: {
    justifyContent: 'center' as 'center',
    width: '100%',
    paddingBottom: 6 + (26 / 2),
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0
  },
  validBadge: {
    top: (-(26 / 2)),
    width: 26,
    height: 26,
    position: 'absolute' as 'absolute',
    flexDirection: 'column' as 'column',
    justifyContent: 'center' as 'center',
    borderRadius: 50
  },
  generateButton: {
    justifyContent: 'center' as 'center',
    width: '100%',
    paddingTop: 6 + (26 / 2),
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0
  }
}

export default LoadPrivateKey
