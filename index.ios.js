require('crypto')
import process from 'process'
import buffer from 'buffer'

import { AppRegistry } from 'react-native';
import App from './dist';

AppRegistry.registerComponent('peerassets-wallet', () => App);
