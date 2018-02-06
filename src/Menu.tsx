import * as React from 'react'
import { Text, View, Dimensions } from 'react-native'

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router'

import { Button, connectStyle, variables, Right, Icon } from 'native-base/src/index'

let tabStyles = {
  button: {
    height: '100%',
    borderRadius: 0,
    padding: 0,
  },
  link: {
    color: variables.btnInfoColor,
    textDecorationLine: 'none',
    textDecoration: 'none',
    paddingLeft: 15,
    paddingRight: 15,
    height: '100%',
    justifyContent: 'center',
    flexDirection: 'column',
    display: 'flex'
  },
  selected: {
    color: variables.btnPrimaryColor,
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
      <Button {...selected === link ? { primary: true } : { info: true }} style={style.button}>
        <Link to={link} style={linkStyle}>{name}</Link>
      </Button>
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
        <Tab name='Decks' selected={location.pathname} />
        <Right>
          <Button info style={style.button}>
            <Link onPress={logout} to='/login' style={style.link}><Icon name='sign-out' color='white'/></Link>
          </Button>
        </Right>
      </View>
    )
  }
}

export default connect(
  ({ router }: { router: any })=> router,
  dispatch => ({ logout: () => dispatch({ type: 'HARD_LOGOUT' }) })
)(Nav)