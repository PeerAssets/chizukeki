
import * as React from 'react'
import { Picker as RNPicker } from 'react-native';
// TODO this errors, maybe because of react-native-web
//import { Picker, Right, Radio, Text } from 'native-base'
import IssueModes from './issueModes'

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
    let { selected, select } = this.props
    return (
      <RNPicker
        prompt='Select one'
        selectedValue={selected !== null ? IssueModes.decode(selected): ''}
        onValueChange={mode => select(IssueModes.encode(mode))}
        mode='dropdown' >
        { Object.keys(IssueModes.nameToEncodingMap).map((mode: IssueModes) =>
          <RNPicker.Item key={mode} label={mode} value={mode}/>
        ) }
      </RNPicker>
    )
  }
}

namespace IssueMode {
  export type Data = IssueModes.Encoding
  export type Props = {
    selected: Data | null,
    select: (mode: Data) => any
  }
}

export default IssueMode
