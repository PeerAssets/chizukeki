import * as React from 'react'; import { Component } from 'react';
import { Dimensions, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  FormLabel, FormInput, FormValidationMessage,
  Card,
  Button
} from 'react-native-elements'

import * as bitcore from '../bitcore'

namespace LoadPrivateKey {
  export type Data = { privateKey: string }
}

class LoadPrivateKey extends React.Component<{ loadPrivateKey: (data: LoadPrivateKey.Data) => void }, LoadPrivateKey.Data> {
  state = { privateKey: '' }
  render() {
    return (
      <Card containerStyle={styles.container} >
        <Text style={styles.welcome}> Import or generate key </Text>
        <FormLabel>Name</FormLabel>
        <FormInput value={this.state. privateKey} onChangeText={privateKey => this.setState({ privateKey })} />
        <FormValidationMessage>Error message</FormValidationMessage>
        <Button
          buttonStyle={styles.secondaryButton}
          textStyle={styles.secondaryText}
          onPress={() => this.props.loadPrivateKey(this.state)}
          title="LoadPrivateKey Key" />
        <Button
          buttonStyle={styles.primaryButton}
          onPress={() => this.setState({ privateKey: new bitcore.PrivateKey().toString() })}
          title="Generate me a new key" />
      </Card>
    )
  }
}

const styles = EStyleSheet.create({
  primaryButton: {
    marginTop: 15,
    borderColor: 'blue',
    borderRadius: 3,
    backgroundColor: 'blue',
    borderWidth: 1,
  },
  secondaryButton: {
    marginTop: 15,
    backgroundColor: 'white',
    borderColor: 'blue',
    borderRadius: 3,
    borderWidth: 2,
  },
  secondaryText: {
    color: 'blue',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    maxHeight: () => 0.5 * Dimensions.get('window').height,
    width: () => 0.5 * Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 3,
    borderWidth: 0
  },
});

export default LoadPrivateKey