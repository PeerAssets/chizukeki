import * as React from 'react'
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';

import {
  Button,
  variables
} from 'native-base/src/index'
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import { ReactChildren, ReactElement } from 'react';

import { Routine } from '../store/routine'
import { AnyAction } from 'typescript-fsa';

type Block<State> = (state: State) => ReactElement<State>

type Infos<State> = { 
  started: Block<State>
  done: Block<State>
  failed: Block<State>
}

function createRoutineButton<State, R extends Routine<any, any, any>>(
  routine: R, messages: Partial<Infos<State>>
){
  let rSwitch = Object.assign({
    started: (state: State) => <ActivityIndicator loading/>,
    done: (state: State) => 'Success!',
    failed: (state: State) => 'Failure!',
  }, messages)
  let styleSwitch = {
    started: () => ({ info: true }),
    done: () => ({ success: true }),
    failed: () => ({ danger: true }),
  }
  class RoutineButton extends React.Component<
    { actionType: string, state?: State, children: ReactChildren } & Button.props
  > {
    render() {
      let { actionType, state, children, ...props } = this.props
      let a = { type: actionType, payload: state } as AnyAction
      return (
        <Button {...props} {...routine.switch<any>(a, styleSwitch) }>
          { routine.switch(a, rSwitch) } { children }
        </Button>
      )
    }
  }
  return RoutineButton

}