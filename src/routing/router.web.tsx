import * as React from 'react'
import * as RouterPackage from 'react-router-dom'
import { LinkProps } from 'react-router-dom'

export function Link({ onPress: onClick, ...props }: LinkProps & { onPress?: LinkProps['onClick'] }){
  return <RouterPackage.Link {...onClick ? { onClick } : {}} {...props}/>
}

export const { Route, Redirect } = RouterPackage
export const Router = RouterPackage.BrowserRouter