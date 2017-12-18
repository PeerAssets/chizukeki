import * as React from 'react'
import { Text, View, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet';

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router' 

import { RkButton } from 'react-native-ui-kitten'

function NavLink({
  name,
  link = `/${name.toLowerCase()}`,
  selected 
}: { name: string, link?: string, selected: string }) {
  let style = selected === link ?
    [styles.link, { backgroundColor: 'lightblue' }] :
    [styles.link] 
  return (
    <RkButton style={style}>
      <Link to={link}>{name}</Link>
    </RkButton>
  )
}

function Nav({ location, ...props }){
  return (
    <View style={[ styles.container, styles.buttonContainer ]}>
      <NavLink name='Wallet' selected={location.pathname}/>
      <NavLink name='Decks' selected={location.pathname}/>
    </View>
  )
}


export default withRouter(Nav)

const styles = EStyleSheet.create({
  container: {
    width: '$width',
    flex: 1,
    zIndex: 1,
    position: 'absolute',
    height: 50,
    padding: 0,
    left: 0,
    top: 0,
  },
  buttonContainer: {
    marginTop: 0,
    marginBottom: 0,
    height: 50,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'rgb(73,111,194)',
  },
  buttonStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    marginRight: 2,
  },
  link: {
    color: 'black',
    textDecorationLine: 'none'
  }
})
