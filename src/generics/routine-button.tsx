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

class RoutineButton extends React.Component<Props, { alerting: boolean }> {
  
  state = { alerting: false }

  componentWillReceiveProps({ stage }){
    if(
      (!this.state.alerting) &&
      (['DONE', 'FAILED'].includes(stage)) &&
      this.props.stage &&
      (this.props.stage !== stage)
    ){
      this.setState({ alerting: true })
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

  render() {
    let {
      stage, icons = {}, onPress, children,
      STARTED, DONE, FAILED, DEFAULT,
      ...props
    } = this.props

    let stageBased = this.stageSwitch({
      DEFAULT: { info: true, onPress },
      STARTED: { info: true, onPress },
      DONE: this.dismissable('success'),
      FAILED: this.dismissable('danger')
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