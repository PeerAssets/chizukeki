import * as React from 'react'
import { Text, View, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet';

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router' 

import { RkButton, RkStyleSheet  } from 'react-native-ui-kitten'

function NavLink({
  name,
  link = `/${name.toLowerCase()}`,
  selected 
}: { name: string, link?: string, selected: string }) {
  let style = selected === link ?
    [styles.selected] :
    [] 
  return (
    <RkButton style={style}>
      <Link to={link} style={[styles.link]}>{name}</Link>
    </RkButton>
  )
}

function Nav({ location, ...props }){
  return (
    <View style={[ styles.container ]}>
      <NavLink name='Wallet' selected={location.pathname}/>
      <NavLink name='Decks' selected={location.pathname}/>
    </View>
  )
}


export default withRouter(Nav)

let styles = RkStyleSheet.create(theme => ({
  container: {
    width: theme.width,
    flex: 1,
    zIndex: 1,
    position: 'absolute',
    height: 50,
    padding: 0,
    left: 0,
    top: 0,
    flexDirection: 'row',
    backgroundColor: theme.colors.screen.alter
  },
  buttonStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 2,
  },
  link: {
    color: 'black',
    textDecorationLine: 'none'
  },
  selected: {
    backgroundColor: theme.colors.primary
  }
}))
