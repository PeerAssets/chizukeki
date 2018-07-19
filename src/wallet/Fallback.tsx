import * as React from 'react'
import { View, ViewStyle } from 'react-native'
import { connect } from 'react-redux'
import { Redirect } from '../routing/router'
import { State } from './redux'
import { withRouter } from 'react-router'

import Keys, { UnlockThenCopy } from './Keys'
import { Link } from '../routing/router'

import { Card, CardItem, Body, Button, Icon, Text, } from 'native-base'

import { Wrapper, Main } from '../generics/Layout'

const testerUtils = {
  parsePersisted: (key) => {
    let stored = JSON.parse(localStorage["persist:" + key])
      Object.keys(stored).forEach(key => stored[key] = JSON.parse(stored[key]))
      return stored
  },
  hydrateStore: (json) => {
    Object.keys(json).forEach(
      key => localStorage.setItem(
        "persist:" + key,
        JSON.stringify({ [key]: JSON.stringify(json[key][key]) })
      )
    )
  },
  getFullStoreState: () => {
    return ['wallet', 'assets'].reduce((store, key) =>
        (store[key] = testerUtils.parsePersisted(key), store), {})
  },
  getStateAsFile: () => {
    var file = new Blob(
      [JSON.stringify(testerUtils.getFullStoreState(), null, 2)],
      {type: 'text/plain'}
    );
    return URL.createObjectURL(file);
  }
}


type Props = {
  keys?: Keys,
  address?: string,
  logout: () => any
}

let styles: Record<string, ViewStyle> = {
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  column: {
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    margin: 7.5,
    flex: 1,
  }
}

class Fallback extends React.Component<Props, { error: boolean }> {
  state = { error: false }
  downloadCrashState = () => {
    var element = document.createElement("a");
    element.href = testerUtils.getStateAsFile();
    element.download = "chizukeki-crash-state.json";
    element.click();
  }
  componentDidCatch(error, info) {
    console.error(error, info)
    this.setState({ error: true })
  }
  wipe = () => {
    this.props.logout()
    this.setState({ error: false })
  }
  render() {
    const { keys, children } = this.props
    return !this.state.error ? children : (
      <Wrapper>
        <Main>
          <Card style={{ width: '100%', flex: 1, maxHeight: 265 }}>
            <CardItem styleNames='header'>
              <Text>
                There has been a critical error.
                Try refreshing the page, and if the problem persists,
                recover your key below and logout
              </Text>
            </CardItem>
            <CardItem>
              <Body style={styles.body}>
                {keys ? (
                  <UnlockThenCopy keys={keys} />
                ) : (
                <Text styleNames="danger">
                  Local Storage state is unrecoverable
                </Text>
                )}
              </Body>
            </CardItem>
            <CardItem style={{ justifyContent: 'space-around' }}>
              <Button styleNames='iconLeft primary' onPress={this.downloadCrashState}>
                <Icon name='download' style={{ color: 'white' }} />
                <Text>Download Crash State</Text>
              </Button>
              <Link onPress={this.wipe} to='/login' style={styles.logout}>
                <Button styleNames='iconLeft warning'>
                  <Icon name='sign-out' style={{ color: 'white' }} />
                  <Text>Wipe Data and Logout</Text>
                </Button>
              </Link>
            </CardItem>
          </Card>
        </Main>
      </Wrapper>
    )
  }

}

export default withRouter(connect(
  ({ wallet: { wallet } }: { wallet: State }) => (wallet || {}),
  dispatch => ({ logout: () => dispatch({ type: 'HARD_LOGOUT' }) })
)(Fallback) as any)

