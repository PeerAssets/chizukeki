import * as React from 'react'
import { Text, View, Dimensions } from 'react-native'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router'

import { Button, connectStyle, variables, Right, Icon } from 'native-base'

let tabStyles = {
  link: {
    color: variables.btnInfoColor,
    textDecorationLine: 'none',
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    display: 'flex',
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: variables.btnInfoBg
  },
  selected: {
    color: variables.btnPrimaryColor,
    backgroundColor: variables.btnPrimaryBg
  },
}

let navStyles = {
  ...tabStyles,
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 50,
    opacity: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',

    zIndex: 1,
    width: '100%',
    backgroundColor: variables.btnInfoBg
  },
}

@connectStyle('PeerKeeper.Nav.Tab', tabStyles)
class Tab extends React.Component<{ name: string, link?: string, selected: string, style?: any }> {
  render() {
    let { name, link = `/${this.props.name.toLowerCase()}`, style, selected } = this.props
    let linkStyle = Object.assign({}, style.link, selected === link ? style.selected : {})
    return (
      <Link to={link} style={linkStyle}>
        <Text>{name}</Text>
      </Link>
    )
  }
}

@connectStyle('PeerKeeper.Nav.Tab', navStyles)
class Nav extends React.Component<{ location: { pathname: string }, style?: any, logout: () => any }> {
  constructor(props){ super(props) }
  render() {
    let { style, location, logout } = this.props
    return (
      <View style={style.container}>
        <Tab name='Wallet' selected={location.pathname} />
        <Tab name='Assets' selected={location.pathname} />
        <Right>
          <Link onPress={logout} to='/login' style={style.link}>
            <Icon name='sign-out' style={{color:'white'}} />
          </Link>
        </Right>
      </View>
    )
  }
}

export default withRouter(connect(
  () => ({}),
  dispatch => ({ logout: () => dispatch({ type: 'HARD_LOGOUT' }) })
)(Nav) as any)
