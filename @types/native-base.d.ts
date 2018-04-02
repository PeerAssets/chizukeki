declare module "native-base" {
  import * as React from "react";
  import * as ReactNative from "react-native";
  namespace NativeBase {
    export function connectStyle(
      componentStyleName: string,
      componentStyle: any,
      mapPropsToStyleNames?: Function,
      options?: any
    ): <P, T extends React.ComponentType<P>>(wrapped: T) => T;

    export const getTheme: Function;
    export const variables: any;
  }
}