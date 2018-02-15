import * as React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { Route, Redirect } from '../routing/router'
import Wallet from './Wallet'

class LoggedIn extends React.Component<{loggedIn: boolean}> {
  render(){
    let { loggedIn, children } = this.props 
    return !loggedIn ?
      <Redirect to='/login' /> :
      children
  }

}
export default withRouter(connect(
  (state: { wallet: { wallet: Wallet.Data } }) => {
    return { loggedIn: Wallet.isLoaded(state.wallet.wallet) }
  },
  () => ({})
)(LoggedIn) as any)
