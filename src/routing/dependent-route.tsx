import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
  RouteProps
} from 'react-router-dom'

type Selector<Props = any> = (props: Props) => boolean

type BaseProviderProps = {
  isSatisfied: Selector,
  pathname: string
}
type SimpleProviderProps = {
  prop: string,
  pathname: string
}
type ProviderProps =  BaseProviderProps | SimpleProviderProps

function isBaseProviderProps(props: ProviderProps): props is BaseProviderProps {
  return props.hasOwnProperty('isSatisfied')
}

function normalizeDependency(props: ProviderProps): BaseProviderProps {
  return isBaseProviderProps(props) ?
    props : {
      pathname: props.pathname,
      isSatisfied: p => Boolean(p[props.prop])
    }
}

function DependentRoute({
  component: Component,
  dependency, ...rest
}: RouteProps & { dependency: ProviderProps }) {
  return (
    <Route {...rest} render={props => (
      (normalizeDependency(dependency).isSatisfied(props) && Component) ? (
        <Component {...props} />
      ) : (
          <Redirect to={{
            pathname: dependency.pathname,
            state: { from: props.location }
          }} />
        )
    )} />
  )
}

export default DependentRoute