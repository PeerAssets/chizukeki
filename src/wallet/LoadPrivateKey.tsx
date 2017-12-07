import * as React from 'react'; import { Component } from 'react';
import { Dimensions, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Card,
  Button,
  ButtonGroup
} from 'react-native-elements'

import * as bitcore from '../bitcore'

namespace LoadPrivateKey {
  export type Data = { privateKey: string }
}

type Format = 'wif' | 'raw'
function SelectFormat({ selected, select, style }: { selected: Format, select: (f:Format) => void, style: any }){
  const buttons = {
    wif: () => <Text>Wif</Text>,
    raw: () => <Text>Private Key</Text>
  }
  const formats: Format[] = ['wif', 'raw'] as Format[]
  return (
    <ButtonGroup
      onPress={(i: 0 | 1) => select(formats[i])}
      selectedIndex={formats.indexOf(selected)}
      buttons={formats.map(f => ({ element: buttons[f]}))}
      containerStyle={style} />
  )
}

type State = LoadPrivateKey.Data & { format: Format }

function normalize({ privateKey, format }: State): LoadPrivateKey.Data {
  return (format === 'wif') ?
      { privateKey: bitcore.PrivateKey.fromWIF(privateKey).toString() } :
      { privateKey }
}

class LoadPrivateKey extends React.Component<
  { loadPrivateKey: (data: LoadPrivateKey.Data) => void },
  State
> {
  state = { privateKey: '', format: 'raw' as Format }
  render() {
    let { privateKey, format } = this.state
    return (
      <Card containerStyle={styles.container} >
        <Text style={styles.welcome}> Import or generate key </Text>
        <SelectFormat
          selected={format}
          select={format => this.setState({ format })}
          style={styles.selectFormat} />
        <Button
          buttonStyle={styles.secondaryButton}
          textStyle={styles.secondaryText}
          onPress={() => this.setState({ privateKey: new bitcore.PrivateKey().toString() })}
          title="Generate a new key" />
        <FormInput value={this.state. privateKey} onChangeText={privateKey => this.setState({ privateKey })} />
        <Button
          buttonStyle={styles.primaryButton}
          onPress={() => this.props.loadPrivateKey(normalize(this.state))}
          title="Import and Sync" />
      </Card>
    )
  }
}

const styles = EStyleSheet.create({
  $width: () => 0.5 * Dimensions.get('window').width,
  container: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: () => 0.75 * Dimensions.get('window').height,
    width: () => 0.5 * Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 3,
    borderWidth: 0
  },
  primaryButton: {
    marginTop: 15,
    borderColor: 'blue',
    borderRadius: 3,
    backgroundColor: 'blue',
    borderWidth: 1,
    width: () => '0.5 * $width'
  },
  secondaryButton: {
    marginTop: 15,
    backgroundColor: 'white',
    borderColor: 'blue',
    borderRadius: 3,
    borderWidth: 2,
    width: () => '0.5 * $width'
  },
  secondaryText: {
    color: 'blue',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  selectFormat: {
    flex: 1,
    height: () => 0.1 * Dimensions.get('window').height,
    width: () => 0.25 * Dimensions.get('window').width,
  },
});

export default LoadPrivateKey