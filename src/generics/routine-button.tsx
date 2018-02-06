import * as React from 'react'
import { mapObjIndexed } from 'ramda'
import { Text, Button, Icon, Spinner, variables } from 'native-base/src/index'
import { Routine } from './routine';
import { lang } from 'moment';
import { Dimensions } from 'react-native';

type Stage = 'STARTED' | 'DONE' | 'FAILED' | 'DEFAULT'

type DismissProps = Array<{
  stage?: Stage,
  stages?: Array<Stage>,
  auto?: boolean,
  onAutoDismiss?: () => any,
  onPressDismiss?: () => any,
  after?: number
}>

type Props = {
  stage: string | undefined
  onPress: () => any
  icons?: Partial<Record<Stage, string | React.ReactElement <any> | undefined>>
  dismiss?: DismissProps
  STARTED?: string
  DONE?: string
  FAILED?: string
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

  stageSwitch = (cases: Record<Stage, any>) => {
    let stage: Stage = (
      (!this.props.stage) ||
      ((!this.state.alerting) && this.props.stage !== 'STARTED')
    ) ?
      'DEFAULT' :
      this.props.stage as Stage
    return cases[stage] || cases.DEFAULT
  }

  dismissProps(queryStage: Stage) {
    for (let {
      stage,
      stages = [],
      auto = false,
      after = 2500,
      onAutoDismiss = () => { },
      onPressDismiss = () => { }
    } of this.props.dismiss || []) {
      if (stage === queryStage || stages.includes(queryStage)) {
        let dismiss = () => this.setState({ alerting: false })
        if((this.props.stage === queryStage) && auto){
          setTimeout(() => {
            if (this.state.alerting) {
              dismiss()
              onAutoDismiss()
            }
          }, after)
        }
        return {
          onPress: () => {
            dismiss()
            onPressDismiss()
          }
        }
      }
    }
  }
  dismissable = (stage: Stage, attr: string) => ({
    [attr]: true,
    ...this.dismissProps(stage)
  })


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
      DONE: this.dismissable('DONE', 'success'),
      FAILED: this.dismissable('FAILED', 'danger')
    })

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