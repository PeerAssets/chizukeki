import React, { Component } from "react";
import { View, ViewPropTypes } from "react-native";
import { Toast } from "native-base";

class Root extends Component {
  render() {
    return (
      <View ref={c => (this._root = c)} {...this.props} style={{ flex: 1 }}>
        {this.props.children}
        <Toast
          ref={c => {
            if (c) Toast.toastInstance = c;
          }}
        />
      </View>
    );
  }
}

export default Root;