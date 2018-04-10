import * as React from 'react'
import { Text, View, Platform } from 'react-native'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router'

import { Button, connectStyle, variables, Right, Icon } from 'native-base'
import Header from './generics/header'

let tabStyles = {
  link: {
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    display: 'flex',
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: variables.btnInfoBg
  },
  linkText: {
    color: variables.btnInfoColor,
    textDecorationLine: 'none'
  },
  linkTextSelected: {
    color: variables.btnPrimaryColor,
    textDecorationLine: 'none'
  },
  selected: {
    backgroundColor: variables.btnPrimaryBg,
  },
}

let navStyles = {
  ...tabStyles,
  container: {
    backgroundColor: variables.btnInfoBg
  },
}

@connectStyle('PeerKeeper.Nav.Tab', tabStyles)
class Tab extends React.Component<{ name: string, link?: string, selected: string, style?: any }> {
  render() {
    let { name, link = `/${this.props.name.toLowerCase()}`, style, selected } = this.props
    let linkStyle = Object.assign({}, style.link, selected === link ? style.selected : {})
    let linkText = selected === link ? style.linkTextSelected : style.linkText
    return (
      <Link to={link} style={linkStyle}>
        <Text style={linkText}>{name}</Text>
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
      <Header style={style.container}>
        <Tab name='Wallet' selected={location.pathname} />
        <Tab name='Assets' selected={location.pathname} />
        <Right>
          <Link onPress={logout} to='/login' style={style.link}>
            <Icon name='sign-out' style={{color:'white'}} />
          </Link>
        </Right>
      </Header>
    )
  }
}

export default withRouter(connect(
  () => ({}),
  dispatch => ({ logout: () => dispatch({ type: 'HARD_LOGOUT' }) })
)(Nav) as any)
