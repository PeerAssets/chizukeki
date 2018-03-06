import * as React from 'react'
import * as RouterPackage from 'react-router-native'

function Link({ onPress, ...props }: RouterPackage.LinkProps & { onPress?: React.EventHandler<any> }){
  return <RouterPackage.Link {...onPress ? { onPress } : {}} {...props}/>
}

const { Route, Redirect } = RouterPackage
const Router = RouterPackage.NativeRouter

export { Route, Router, Redirect, Link }

export default RouterPackage
