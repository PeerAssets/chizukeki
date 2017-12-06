import * as React from 'react'; import { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Card, Button } from 'react-native-elements'


class Welcome extends React.Component<{}> {
  render() {
    return (
      <Card containerStyle={styles.container}>
        <Text style={styles.welcome}>
          Welcome
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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
