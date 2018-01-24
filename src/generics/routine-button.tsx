import * as React from 'react'
import { ActivityIndicator } from 'react-native'
import { Text, Button, Icon, variables } from 'native-base/src/index'
import { Routine } from './routine';

type RoutineTexts = {
  STARTED?: string,
  DONE?: string,
  FAILED?: string,
  DEFAULT: string
}

function RoutineButton({
    stage, onPress, children, STARTED, DONE, FAILED, DEFAULT, ...props,
  }: { stage: string | undefined, onPress: () => any } & RoutineTexts & { [key: string]: any }){
  let stageBased = stage === 'DONE'
    ? { success: true }
    : stage === 'FAILED'
    ? { danger: true }
    : { info: true, onPress }
  return (
    <Button {...stageBased } {...props}>
      <ActivityIndicator animating={stage === 'STARTED'}/>
      <Text>{ (stage && { STARTED, DONE, FAILED }[stage]) || DEFAULT}</Text>
    </Button>
  )
}

export default RoutineButton