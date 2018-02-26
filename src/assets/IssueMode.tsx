
import * as React from 'react'
import { Picker as RNPicker } from 'react-native';
let Item = RNPicker.Item
import { Picker, Right, Radio, Text } from 'native-base/src/index'
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
      <Picker
        prompt='Select one'
        selectedValue={selected !== null ? IssueModes.decode(selected): null}
        onValueChange={mode => select(IssueModes.encode(mode))}
        mode='dropdown' >
        { Object.keys(IssueModes.nameToEncodingMap).map((mode: IssueModes) =>
          <Item key={mode} label={mode} value={mode} />
        ) }
      </Picker>
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