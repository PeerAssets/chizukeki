// native-base Item that has ref handling built in
import * as React from 'react';
import { ViewStyle, TouchableOpacityProperties } from 'react-native'
import { Item as _Item } from 'native-base'

const Item: any = _Item 

interface ItemProps extends TouchableOpacityProperties {
  fixedLabel?: boolean;
  floatingLabel?: boolean;
  inlineLabel?: boolean;
  stackedLabel?: boolean;
  placeholderLabel?: boolean;
  bordered?: boolean;
  regular?: boolean;
  underline?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  error?: boolean;
  placeholder?: string;
  secureTextEntry?: boolean;
  success?: boolean;
  last?: boolean;
  styleNames?: string;
  style?: ViewStyle;
}

type Focusable = any // React.ReactElement<any> & { focus: Function }

interface FieldProps extends ItemProps {
  children: (refHandler: (ref: Focusable | null) => any) => React.ReactNode
}

export default class Field extends React.Component<FieldProps> {
  focusable: Focusable
  onPress = (e) => {
    // https://github.com/shoutem/ui/issues/44#issuecomment-297669041
    if (this.focusable) {
      if(this.focusable.focus) {
        this.focusable.focus(e)
      } else if (
        this.focusable.wrappedInstance &&
        this.focusable.wrappedInstance.focus
      ) {
        this.focusable.wrappedInstance.focus(e)
      } else {
        console.warn(`${this.focusable.constructor.displayName} cannot be programmatically focused`)
      }
    }
    if (this.props.onPress) {
      this.props.onPress(e)
    }
  }
  render() {
      let { children, onPress, ...props } = this.props

      return (
        <Item onPress={this.onPress} {...props} accessible={false}>
          {children(n => n ? this.focusable = n : null)}
        </Item>
      )
  }
}