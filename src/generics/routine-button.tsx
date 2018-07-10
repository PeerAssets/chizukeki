import * as React from 'react'
import { mapObjIndexed } from 'ramda'
import { Text, Button, Icon, Spinner, variables, Toast } from 'native-base'
import { Routine } from './routine';
import { lang } from 'moment';
import { Platform, Dimensions } from 'react-native';
import ToastConfig from './toast-config';

type Stage = 'STARTED' | 'DONE' | 'FAILED' | 'DEFAULT' | 'STOPPED'

type DismissProps = Array<{
  stage?: Stage,
  stages?: Array<Stage>,
  auto?: boolean,
  onAutoDismiss?: () => any,
  onPressDismiss?: () => any,
  after?: number
}>

namespace RoutineButton {
  export type Props = {
    stage: string | undefined
    onPress: () => any
    icons?: Partial<Record<Stage, string | React.ReactElement<any> | undefined>>
    toasts?: Partial<Record<Stage, ToastConfig>>
    dismiss?: DismissProps
    STARTED?: string
    DONE?: string
    FAILED?: string
    STOPPED?: string
    DEFAULT: string

    disabled?: boolean
    style?: any
    styleNames?: string
  }
}
type Props = RoutineButton.Props

function ButtonIcon(name: string){
  return <Icon styleNames='inline' {...{ name, size: 30, color: 'black' }}/>
}

const defaultIcons = {
  STARTED: <Spinner size={Platform.OS === 'ios' ? 0 : 30} color='white' />,
  DONE: ButtonIcon('check'),
  FAILED: ButtonIcon('close'),
  DEFAULT: undefined,
  STOPPED: undefined
}

function normalizeIcons(icons: Props['icons'] = {}){
  return mapObjIndexed(
    (icon, key) => typeof (icon) === 'string' ? ButtonIcon(icon) : (icon || defaultIcons[key]),
    Object.assign({}, defaultIcons, icons)
  )
}

Object.assign(window,{Toast})
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
    if (
      (['DONE', 'FAILED', 'STOPPED'].includes(stage)) &&
      this.props.stage !== stage &&
      this.props.toasts
    ) {
      let toast = this.props.toasts[stage]
      if (toast) {
        let config = ToastConfig(toast)
        if (stage === 'DONE' && !config.type) {
          config.type = 'success'
        }
        if (stage === 'FAILED' && !config.type) {
          config.type = 'danger'
        }
        if (stage === 'STOPPED' && !config.type) {
          config.type = 'warning'
        }
        Toast.show(config)
      }
    }
  }

  stageSwitch = (cases: Record<Stage, any>) => {
    let stage: Stage = (
      (!this.props.stage) ||
      ((!this.state.alerting) && !['STARTED', 'STOPPED'].includes(this.props.stage))
    ) ?
      'DEFAULT' :
      this.props.stage as Stage
    return cases[stage] || cases.DEFAULT }

  dismissProps(queryStage: Stage) {
    let dismiss = () => this.setState({ alerting: false })
    for (let config of this.props.dismiss || []) {
      let {
        stage,
        stages = [],
        auto = false,
        after = 5000,
        onAutoDismiss = () => {},
        onPressDismiss = () => {}
      } = config
      if (stage === queryStage || stages.includes(queryStage)) {
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
    return { onPress: dismiss }
  }

  dismissable = (stage: Stage, styleNames: string) => ({
    styleNames,
    ...this.dismissProps(stage)
  })


  render() {
    let {
      stage, icons = {}, onPress, children,
      STARTED, DONE, FAILED, DEFAULT, STOPPED,
      styleNames = '',
      ...props
    } = this.props
    if(this.state.alerting !== false){
      stage = this.state.alerting
    }

    let icon = this.stageSwitch(normalizeIcons(icons))
    styleNames = `${styleNames} ${icon ? 'iconLeft' : ''}`

    let stageBased = this.stageSwitch({
      DEFAULT: { styleNames: `info ${styleNames}`, onPress },
      STOPPED: { styleNames: `warning ${styleNames}`, onPress },
      STARTED: { styleNames: `info ${styleNames}` },
      DONE: this.dismissable('DONE', `success ${styleNames}`),
      FAILED: this.dismissable('FAILED', `danger ${styleNames}`)
    })

    return (
      <Button {...stageBased } {...props}>
        {icon}
        <Text>{this.stageSwitch({ STARTED, DONE, FAILED, DEFAULT, STOPPED })}</Text>
      </Button>
    )
  }
}

export default RoutineButton
