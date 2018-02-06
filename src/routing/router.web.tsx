import * as React from 'react'
import * as RouterPackage from 'react-router-dom'
import { LinkProps } from 'react-router-dom'

function Link({ onPress: onClick, ...props }: LinkProps & { onPress?: LinkProps['onClick'] }){
  return <RouterPackage.Link {...onClick ? { onClick } : {}} {...props}/>
}

const { Route, Redirect } = RouterPackage
const Router = RouterPackage.BrowserRouter

export { Route, Router, Redirect, Link }

export default RouterPackage