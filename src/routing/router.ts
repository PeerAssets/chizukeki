import * as RouterPackage from 'react-router-native'

/*
 * Remove Platform specific exports for use in main application
 * */

export const { Link, Route, Redirect } = RouterPackage

export const Router = RouterPackage.NativeRouter
