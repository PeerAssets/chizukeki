import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';

let styles = {
  wrapper: {
    flexDirection: 'row' as 'row',
    flexWrap: 'wrap' as 'wrap',
    width: '100%',
    maxWidth: 900,
    padding: 15,
    alignItems: 'flex-start' as 'flex-start',
    justifyContent: 'space-around' as 'space-around'
  },
  main: {
    flex: 5,
    minWidth: 425,
    maxWidth: 600,
    marginTop: -5,
    flexDirection: 'column' as 'column',
    justifyContent: 'space-around' as 'space-around',
    alignItems: 'center' as 'center',
    overflow: 'hidden' as 'hidden',
  },
  secondary: {
    flex: 4,
    minWidth: 300,
    maxWidth: 600,
    margin: 7.5,
  },
}

function Layout(styles){
  return ({ children, style = {} }) => (
    <View style={{ ...styles, ...style }}>
      {children}
    </View>
  )
}

const Wrapper = Layout(styles.wrapper)
const Main = Layout(styles.main)
const Secondary = Layout(styles.secondary)

export { Wrapper, Main, Secondary }
