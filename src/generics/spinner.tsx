import React from "react"
import { StyleProp } from "react-native"
import { ActivityIndicator } from "react-native";
import { connectStyle, variables } from 'native-base'

const styles = {
  color: variables.defaultSpinnerColor,
  width: 36
}

/*{
  style: any,
  inverse?: boolean,
  color?: string,
  size?: 'small' | 'large'
}*/

@connectStyle('PeerKeeper.Spinner', styles)
class Spinner extends React.Component<any, {}> {
  _root: any
	render() {
    let { style, color = style.color, size = style.width, ...props } = this.props
		return (
			<ActivityIndicator
				ref={(c) => (this._root = c)}
        {...this.props}
        style={Object.assign({}, style, { color })}
				color={style.color}
			/>
		);
	}
}

export { Spinner };
