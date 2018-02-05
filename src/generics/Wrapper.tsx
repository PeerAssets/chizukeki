import * as React from 'react'
import { Dimensions, Text, View } from 'react-native';

let styles = {
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    maxWidth: 700,
    padding: 15,
    alignItems: 'flex-start',
  },
}

function Wrapper({ children, style = styles }){
  return (
    <View style={style.container as any}>
      {children}
    </View>
  )
}

export default Wrapper