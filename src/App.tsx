import * as React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Welcome from './welcome/Welcome'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload, Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload, Shake or press menu button for dev menu',
  web: 'Save code changes to reload, ⌥⌘I for dev tools',
});

export default class App extends React.Component<{}> {
  render() {
    return (
      <View style={styles.container}>
        <Welcome/>
      </View>
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
})
