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

import bitcore from '../bitcore'

namespace LoadPrivateKey {
  export type Data = {
    privateKey: string,
    address: string,
  }
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
      selectedBackgroundColor='lightblue'
      onPress={(i: 0 | 1) => select(formats[i])}
      selectedIndex={formats.indexOf(selected)}
      buttons={formats.map(f => ({ element: buttons[f]}))}
      containerStyle={style} />
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

class LoadPrivateKey extends React.Component<
  { loadPrivateKey: (data: LoadPrivateKey.Data) => void },
  State
> {
  state = {
    privateKey: undefined,
    address: undefined,
    format: 'raw' as Format
  }
  render() {
    let { privateKey, format } = this.state
    return (
      <Card containerStyle={styles.container} wrapperStyle={styles.wrapper} title='Import or generate key' >
        <View style={styles.top}> 
          <SelectFormat
            selected={format}
            select={format => this.setState({ format })}
            style={styles.selectFormat} />
          <Button
            buttonStyle={styles.secondaryButton}
            textStyle={styles.secondaryText}
            onPress={() => this.setState({ privateKey: new bitcore.PrivateKey().toString() })}
            title="Generate a new key" />
        </View> 
        <FormInput
          containerStyle={[styles.input, styles.inputWidth]}
          inputStyle={[styles.inputWidth]}
          value={this.state.privateKey}
          onChangeText={privateKey => this.setState({ privateKey })} />
        <Button
          disabled={!this.state.privateKey}
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
    width: '$width',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 3,
    borderWidth: 0
  },
  top: {
    width: '$width',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrapper: {
    width: '$width',
    alignItems: 'center',
  },
  primaryButton: {
    marginTop: 15,
    borderColor: 'lightblue',
    borderRadius: 3,
    backgroundColor: 'lightblue',
    borderWidth: 1,
    width: () => '0.5 * $width'
  },
  secondaryButton: {
    flex: 2,
    backgroundColor: 'white',
    borderColor: 'lightblue',
    borderRadius: 3,
    borderWidth: 2,
    width: () => '0.5 * $width'
  },
  secondaryText: {
    color: 'blue',
  },
  selectFormat: {
    flex: 1,
    height: () => 0.1 * Dimensions.get('window').height,
    width: () => 0.25 * Dimensions.get('window').width,
  },
  inputWidth: {
    width: '$width - 30',
  },
  input: {
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'lightblue',
    margin: 15,
  }
});

export default LoadPrivateKey