import * as React from 'react'
import { Text, View, Platform } from 'react-native'
import { variables } from 'native-base'

const padding = Platform.OS !== 'web' ? 22 : 0
const header = Platform.OS === 'web' ? 50 : 40

const wrapperStyle = {
  position: 'absolute' as 'absolute',
  top: 0,
  right: 0,
  left: 0,
  height: header + padding,
  opacity: 1,
  zIndex: 1,
  width: '100%'
}
const headerStyle = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  width: '100%',
  height: header,
}

const Padding = ({}) => <View style={{
  opacity: 0.75,
  height: padding,
  backgroundColor: variables.btnPrimaryBg
}}/>

export default ({ style, children, ...props }) => (
  <View style={wrapperStyle} {...props}>
    <Padding/>
    <View style={{ ...headerStyle, ...style }}>
      {...children}
    </View>
  </View>
)