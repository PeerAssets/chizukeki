import { ViewStyle, TextStyle } from 'react-native';

interface ToastConfiguration {
  text: string;
  buttonText?: string;
  position?: "top" | "bottom" | "center";
  type?: "danger" | "success" | "warning";
  duration?: number;
  onClose?: (reason: "user" | "timeout") => any;
  textStyle?: TextStyle;
  buttonTextStyle?: TextStyle;
  buttonStyle?: ViewStyle;
}

type ToastConfig = ToastConfiguration | string

function ToastConfig(config: ToastConfig): ToastConfiguration & { position: "top" | "bottom" | "center" } {
  return (typeof config === 'string') ?
    { text: config, position: 'bottom', duration: 3000 } :
    { position: 'bottom', duration: 3000, ...config }
}

export default ToastConfig