import * as React from 'react'; import { Component } from 'react';
import { Dimensions, View, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  Container,
  Segment,
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
  variables
} from 'native-base/src/index'
import Icon from 'react-native-vector-icons/dist/FontAwesome';

import bitcore from '../bitcore'
import Wrapper from './Wrapper'

namespace LoadPrivateKey {
  export type Data = {
    privateKey: string,
    address: string,
  }
}

type Format = 'wif' | 'raw'

let Touchable = (TouchableOpacity as any)

let choiceStyle = {
  height: '100%',
  paddingLeft: 10,
  paddingRight: 10,
  borderColor: variables.segmentBackgroundColor
}
function SelectFormat({ selected, select, style }: { selected: Format, select: (f: Format) => void, style: any }) {
  function Choice({ selected, format, children, style = [], ...props }) {
    return (
      <Button
        active={selected === format}
        onClick={() => select(format)}
        style={[choiceStyle, ...style]}
        {...props}>
        <Text>{children}</Text>
      </Button>
    )
  }
  return (
    <Segment>
      <Choice first format='wif' selected={selected}>Wif</Choice>
      <Choice last format='raw' selected={selected}>Raw</Choice>
    </Segment>
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
  { action: string, loadPrivateKey: (data: LoadPrivateKey.Data) => void },
  State
  > {
  state = {
    privateKey: '',
    address: undefined,
    format: 'raw' as Format
  }
  render() {
    let { privateKey, format } = this.state
    return (
      <Wrapper>
        <Card >
          <CardItem header>
            <Body style={{ flexDirection: 'row', width: '100%', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              <H2 style={{flexBasis: 200, paddingBottom: 15 }}>Import or Generate Private Key</H2>
              <Button info
                style={styles.selectFormat}
                onPress={() => this.setState({ privateKey: new bitcore.PrivateKey().toString(), format: 'raw' })}>
                <Text>Generate</Text>
              </Button>
            </Body>
          </CardItem>
          <CardItem>
            <Body  style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', flexWrap: 'wrap' }}>
              <SelectFormat
                selected={format}
                select={format => this.setState({ format })}
                style={styles.selectFormat} />
              <Item style={{ marginLeft: 15, minWidth: 300 }}>
                <Icon active name='lock' />
                <Input
                  placeholder={`Paste ${ format === 'raw' ? 'private' : format } key here or Generate a new one`}
                  style={{ fontSize: 12, lineHeight: 14, textOverflow: 'ellipsis' }}
                  value={this.state.privateKey}
                  onChangeText={privateKey => this.setState({ privateKey })} />
              </Item>
            </Body>
          </CardItem>
          <CardItem footer>
            <Body>
            <Button success block disabled={!this.state.privateKey}
                onPress={() => this.props.loadPrivateKey(normalize(this.state))}>
              <Text>Import and Sync</Text>
            </Button>
            </Body>
          </CardItem>
        </Card>
      </Wrapper>
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