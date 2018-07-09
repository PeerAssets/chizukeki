
import * as React from 'react'
import { Picker as RNPicker, Platform } from 'react-native';
// TODO this errors, maybe because of react-native-web
import { Picker as NBPicker, Right, Radio, Text } from 'native-base'
import IssueModes from './issueModes'
import configure from '../configure'

const valid = mode =>
  configure.fromEnv().VALID_ISSUE_MODES.includes(mode)

const web = Platform.OS === 'web'
const Picker = web ? RNPicker : NBPicker

let styles = {
  main: {
    flex: 3,
    minWidth: 325,
    marginTop: -5,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: 'hidden',
  },
}

class IssueMode extends React.Component<IssueMode.Props, {}> {
  render() {
    let { selected, select, ...props } = this.props
    return (
      <Picker
        { ... web ? {} : { placeholder: 'Select one' }}
        prompt='Select one'
        selectedValue={selected !== null ? IssueModes.decode(selected): ''}
        onValueChange={mode => select(IssueModes.encode(mode))}
        mode='dropdown'
        {...props}>
        {
          Object.keys(IssueModes.nameToEncodingMap)
            .filter(valid)
            .map((mode: IssueModes) => <Picker.Item key={mode} label={mode} value={mode}/>)
        }
      </Picker>
    )
  }
}

namespace IssueMode {
  export type Data = IssueModes.Encoding
  export type Props = {
    selected: Data | null,
    select: (mode: Data) => any,
    style?: any
  }
}

export default IssueMode
