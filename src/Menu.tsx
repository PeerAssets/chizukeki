import * as React from 'react'
import { Text, View, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet';

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router' 

import { Button } from 'native-base/src/index'

function NavLink({
  name,
  link = `/${name.toLowerCase()}`,
  selected 
}: { name: string, link?: string, selected: string }) {
  let style = selected === link ?
    [styles.selected] :
    [] 
  return (
    <Button style={style}>
      <Link to={link} style={[styles.link]}>{name}</Link>
    </Button>
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

let styles = EStyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1, position: 'absolute', height: 50,
    padding: 0,
    left: 0,
    top: 0,
    flexDirection: 'row',
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
    backgroundColor: 'white'
  }
})
