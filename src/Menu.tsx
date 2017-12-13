import * as React from 'react'
import { Header, ButtonGroup } from 'react-native-elements'
import { Text, View, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet';

import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Link } from './routing/router' 

function navLink(name: string, link?: string) {
  link = link || `/${name.toLowerCase()}`
  return [ link, () => (
    <Link to={link} style={[styles.link]}>
     {name}
    </Link>
  ) ]
}

const links = [
  navLink('Wallet'),
  navLink('Decks')
]

function Nav({ location, ...props }){
  let urls = links.map(l => l[0])
  let buttons = links.map(l => ({ element: l[1] }))
  return (
    <ButtonGroup
      containerBorderRadius={0}
      containerStyle={styles.buttonContainer}
      buttonStyle={styles.buttonStyle}
      selectedBackgroundColor='lightblue'
      onPress={(i: number) => { }}
      selectedIndex={urls.indexOf(location.pathname)}
      buttons={buttons}
    />
  )
}


export default withRouter(function Menu(props){
  return (
    <Header
      outerContainerStyles={styles.container}
      leftComponent={<Nav {...props}/>} />
  )
})

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
