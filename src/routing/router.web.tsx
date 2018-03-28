import * as React from 'react'
import * as RouterPackage from 'react-router-dom'
import { LinkProps } from 'react-router-dom'

let defaultStyle = { textDecoration: 'none' }
function Link({ onPress: onClick, style = {}, ...props }: LinkProps & { onPress?: LinkProps['onClick'] }){

  return <RouterPackage.Link {...onClick ? { onClick } : {}} {...props} style={{...defaultStyle, ...style }}/>
}

const { Route, Redirect } = RouterPackage
const Router = RouterPackage.BrowserRouter

export { Route, Router, Redirect, Link }

export default RouterPackage
