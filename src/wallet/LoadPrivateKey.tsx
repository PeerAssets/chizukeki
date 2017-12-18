import * as React from 'react'; import { Component } from 'react';
import { Dimensions, Text, View, TouchableOpacity  } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { mixins } from '../style-variables'
import { RkCard, RkButton, RkTextInput, RkChoice, RkChoiceGroup } from 'react-native-ui-kitten'

import bitcore from '../bitcore'

namespace LoadPrivateKey {
  export type Data = {
    privateKey: string,
    address: string,
  }
}

type Format = 'wif' | 'raw'

let Touchable = (TouchableOpacity as any)

function SelectFormat({ selected, select, style }: { selected: Format, select: (f:Format) => void, style: any }){
  function Choice(
    { selected, format, children }: { format: Format, selected: Format, children: string }
  ){
    return (
      <Touchable choiceTrigger>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <RkChoice selected={selected === format} rkType='radio' onPress={() => select(format)}/>
          <Text>{children}</Text>
        </View>
      </Touchable>
    )
  }
  return (
    <RkChoiceGroup radio>
      <Choice format='wif' selected={selected}>Wif</Choice>
      <Choice format='raw' selected={selected}>Private Key</Choice>
    </RkChoiceGroup>
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
      <RkCard containerStyle={styles.container} wrapperStyle={styles.wrapper} title='Import or generate key' >
        <View style={styles.top}> 
          <SelectFormat
            selected={format}
            select={format => this.setState({ format })}
            style={styles.selectFormat} />
          <RkButton
            buttonStyle={styles.secondaryButton}
            textStyle={styles.secondaryText}
            onPress={() => this.setState({ privateKey: new bitcore.PrivateKey().toString() })}
            title="Generate a new key" />
        </View> 
        <View style={[styles.input, styles.inputWidth]}> 
          <RkTextInput
            value={this.state.privateKey}
            onChangeText={privateKey => this.setState({ privateKey })}
            inputStyle={ [styles.inputWidth] }/>
        </View>
        <RkButton
          disabled={!this.state.privateKey}
          buttonStyle={styles.primaryButton}
          textStyle={styles.primaryText}
          disabledStyle={styles.disabled}
          onPress={() => this.props.loadPrivateKey(normalize(this.state))}
          title="Import and Sync" />
      </RkCard>
    )
  }
}

const styles = EStyleSheet.create({
  $width: 0.5 * Dimensions.get('window').width,
  container: {
    width: '$width',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryBackground',
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
    borderColor: '$primaryColor',
    borderRadius: 3,
    backgroundColor: '$primaryColor',
    borderWidth: 1,
    width: () => '0.5 * $width'
  },
  primaryText: {
    color: '$primaryBackground',
  },
  disabled: {
    backgroundColor: '$grey',
  },
  secondaryButton: {
    flex: 2,
    backgroundColor: '$primaryBackground',
    borderColor: '$secondaryColor',
    borderRadius: 3,
    borderWidth: 2,
    width: () => '0.5 * $width'
  },
  secondaryText: {
    color: '$secondaryColor',
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
    borderColor: '$primaryColor',
    margin: 15,
  },
  selected: {
    backgroundColor: '$primaryColor'
  }
})

export default LoadPrivateKey