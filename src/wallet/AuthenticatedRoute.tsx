import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter, RouteProps } from 'react-router'

import { Route, Redirect } from '../routing/router'
import Wallet from './Wallet'

class AuthenticatedRoute extends React.Component<RouteProps & { authenticated: boolean }, {}> {
  render(){
    let { authenticated, render = ()=>null, component: Component, ...rest } = this.props
    return <Route
      {...rest}
      render={props =>
        authenticated ? (
          Component ? <Component {...props} /> :
          render(props)
        ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          )
      }
    />
  }
}

export default withRouter(connect(
  (state: { wallet: { wallet: Wallet.Data } }) => {
    return { authenticated: Wallet.isLoaded(state.wallet.wallet) }
  })(AuthenticatedRoute) as any) as any
