
import * as React from 'react'
import { View, ViewStyle } from 'react-native';
// TODO this errors, maybe because of react-native-web
import { Right, Radio, Text, Button, Label } from 'native-base'
import IssueModes from './issueModes'
import configure from '../configure'

const valid = mode =>
  mode !== 'NONE' &&
  configure.fromEnv().VALID_ISSUE_MODES.includes(mode)

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

interface ChoiceChipProps {
  selected?: boolean
  children: string
  onPress: () => void
  style?: ViewStyle
}

function ChoiceChip(props: ChoiceChipProps){
  let { selected, children, style: styleProp = {}, ...rest } = props
  let style = Object.assign({
    height: 32,
    marginLeft: 15,
    marginTop: 15,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  } as ViewStyle, styleProp)
  let styleNames = `rounded primary ${selected ? '' : 'bordered'}`
  return (
    <Button styleNames={styleNames} style={style} {...rest}>
      <Text>{children}</Text>
    </Button>
  )

}

class IssueMode extends React.Component<IssueMode.Props, {}> {
  render() {
    let { value, onChange, ...props } = this.props
    // selected={mode ^ value === mode}
    return (
      <View {...props}>
        <Label key={0} style={{ maxWidth: 100, color: 'rgb(87, 87, 87)' }}>Issue Mode</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {
            Object.keys(IssueModes.nameToEncodingMap)
              .filter(valid)
              .map((mode: IssueModes) => {
                let modeBits = IssueModes.encode(mode)
                let selected = Boolean((modeBits & value) === modeBits)
                let onPress = () => onChange(
                  selected
                    ? value ^ modeBits // xor, removing the bits
                    : value | modeBits // or, adding the bits, avoiding weird behavoir with combos
                )
                return (
                  <ChoiceChip key={mode} selected={selected} onPress={onPress}>
                    {mode.toLowerCase()}
                  </ChoiceChip>
                )
              })
          }
        </View>
      </View>
    )
  }
}

namespace IssueMode {
  export type Data = IssueModes.Encoding
  export type Props = {
    value: Data,
    onChange: (mode: Data) => any,
    style?: any
  }
}

export default IssueMode
