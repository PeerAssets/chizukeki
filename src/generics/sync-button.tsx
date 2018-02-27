import * as React from 'react'
import RoutineButton from './routine-button'
import { Omit } from './utils'

namespace SyncButton {
  export type Logic = {
    stage: string | undefined
    trigger: () => any,
    stop: () => any,
  }
  export type Props =
    Logic
    & Omit<RoutineButton.Props, 'DEFAULT' | 'onPress'>
    & { DEFAULT?: string, } 
}

const stageTexts = {
  DEFAULT: 'Syncing',
  STOPPED: 'Syncing disabled',
  STARTED: 'Syncing',
  FAILED: 'Sync Failed',
}

class SyncButton extends React.Component<SyncButton.Props> {
  componentDidMount() {
    let { stage, trigger } = this.props
    if(!stage){
      trigger()
    }
  }
  render (){
    let { trigger, stop, dismiss = [], icons = {}, ...props } = this.props
    let syncToggle = props.stage !== 'STOPPED' ? stop : trigger
    return (
      <RoutineButton {...props}
        dismiss={[ ...dismiss, { stage: 'DONE', auto: true, onPressDismiss: syncToggle } ]}
        icons={{ DEFAULT: 'refresh', DONE: 'refresh', ...icons }}
        onPress={syncToggle}
        {...stageTexts}
        {...props}
      />
    )
  }
}

export default SyncButton