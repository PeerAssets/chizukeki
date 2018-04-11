import * as React from 'react'
import { Dimensions, Text, View, ScrollView, Platform } from 'react-native';

let contentContainerStyle = {
  justifyContent: 'space-around' as 'space-around',
  alignItems: 'flex-start' as 'flex-start',
}

let styles = {
  wrapper: {
    flexDirection: 'row' as 'row',
    flexWrap: 'wrap' as 'wrap',
    width: '100%',
    maxWidth: 900,
    padding: 15,
    ...contentContainerStyle
  },
  main: {
    flex: 5,
    minWidth: Platform.OS === 'web' ? 425 : 325,
    maxWidth: 600,
    marginTop: Platform.OS === 'web' ? -5 : 5,
    flexDirection: 'column' as 'column',
    overflow: 'hidden' as 'hidden',
    ...contentContainerStyle
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

let InnerWrapper = Layout(styles.wrapper)
function Wrapper(props){
  return (
    <ScrollView style={{ width: '100%' }} contentContainerStyle={contentContainerStyle} >
      <InnerWrapper {...props}/>
    </ScrollView>
  )
}
const Main = Layout(styles.main)
const Secondary = Layout(styles.secondary)

export { Wrapper, Main, Secondary }
