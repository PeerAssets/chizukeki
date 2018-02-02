import * as React from 'react'
import { mapObjIndexed } from 'ramda'
import { Text, Button, Icon, Spinner, variables } from 'native-base/src/index'
import { Routine } from './routine';
import { lang } from 'moment';

type Stage = 'STARTED' | 'DONE' | 'FAILED' | 'DEFAULT'

type Props = {
  stage: string | undefined,
  onPress: () => any,
  icons?: Partial<Record<Stage, string | React.ReactElement <any> | undefined>>,
  autoDismiss?: {
    stage: 'DONE' | 'FAILED' | Array<'DONE'| 'FAILED'>,
    after?: number
  }
  STARTED?: string,
  DONE?: string,
  FAILED?: string,
  DEFAULT: string

  [key: string]: any
}

function ButtonIcon(name: string){
  return <Icon inline {...{ name, size: 30, color: 'black' }}/>
}

const defaultIcons = {
  STARTED: <Spinner size={30} color='white' />,
  DONE: ButtonIcon('check'),
  FAILED: ButtonIcon('close'),
  DEFAULT: undefined
}

function normalizeIcons(icons: Props['icons'] = {}){
  return mapObjIndexed(
    (icon, key) => typeof (icon) === 'string' ? ButtonIcon(icon) : (icon || defaultIcons[key]),
    Object.assign({}, defaultIcons, icons)
  )
}

class RoutineButton extends React.Component<Props, { alerting: false | Stage }> {
  
  state = { alerting: (false as false | Stage) }

  componentWillReceiveProps({ stage }){
    if(
      (!this.state.alerting) &&
      (['DONE', 'FAILED'].includes(stage)) &&
      this.props.stage &&
      (this.props.stage !== stage)
    ){
      this.setState({ alerting: stage })
    }
  }

  dismissable = (attr: string) => ({
    [attr]: true,
    onPress: () => this.setState({ alerting: false })
  })

  stageSwitch = (cases: Record<Stage, any>) => {
    let stage: Stage = (
      (!this.props.stage) ||
      ((!this.state.alerting) && this.props.stage !== 'STARTED')
    ) ?
      'DEFAULT' :
      this.props.stage as Stage
    return cases[stage] || cases.DEFAULT
  }

  autoDismiss = (queryStage: 'DONE' | 'FAILED') => () => {
    if(!this.props.autoDismiss){
      return false
    }
    let { stage, after = 2500 } = this.props.autoDismiss
    if(stage === queryStage || (Array.isArray(stage) && stage.includes(queryStage))){
      return setTimeout(() => this.setState({ alerting: false }), after)
    }
  }

  render() {
    let {
      stage, icons = {}, onPress, children,
      STARTED, DONE, FAILED, DEFAULT,
      ...props
    } = this.props
    if(this.state.alerting !== false){
      stage = this.state.alerting
    }

    let stageBased = this.stageSwitch({
      DEFAULT: { info: true, onPress },
      STARTED: { info: true, onPress },
      DONE: this.dismissable('success'),
      FAILED: this.dismissable('danger')
    })

    this.stageSwitch({
      DEFAULT(){},
      STARTED(){},
      DONE: this.autoDismiss('DONE'),
      FAILED: this.autoDismiss('FAILED'),
    })()

    let icon = this.stageSwitch(normalizeIcons(icons))
    return (
      <Button iconLeft={Boolean(icon)} {...stageBased } {...props}>
        {icon}
        <Text>{this.stageSwitch({ STARTED, DONE, FAILED, DEFAULT })}</Text>
      </Button>
    )
  }
}

export default RoutineButton