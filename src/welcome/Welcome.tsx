import * as React from 'react'; import { Component } from 'react';
import { Dimensions, Text, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Card, Button } from 'react-native-elements'

function u(){
}

class Welcome extends React.Component<{}> {
  render() {
    return (
      <Card containerStyle={styles.container}>
        <Text style={styles.welcome}> チーズケーキ </Text>
        <Button
          buttonStyle={styles.secondaryButton}
          textStyle={styles.secondaryText}
          onPress={u}
          title="I have a key"/>
        <Button 
          buttonStyle={styles.primaryButton}
          onPress={u}
          title="Generate me a key"/>
      </Card>
    );
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
    maxHeight: '50%',
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 3,
    borderWidth: 0
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default  Welcome
