import deepmerge from 'deepmerge'
import { getTheme, variables as nbVariables } from 'native-base/src/index'

export default (variables = nbVariables) => {
  let basicTextStyles = {
    '.light': {
      color: variables.brandLight,
    },
    '.primary': {
      color: variables.btnPrimaryBg,
    },
    '.success': {
      color: variables.btnSuccessBg,
    },
    '.info': {
      color: variables.btnInfoBg,
    },
    '.warning': {
      color: variables.btnWarningBg,
    },
    '.danger': {
      color: variables.btnDangerBg,
    },
    '.dark': {
      color: variables.brandDark,
    },
  }
  return deepmerge(getTheme(variables), {
    "NativeBase.Text": basicTextStyles,
    "NativeBase.Icon": basicTextStyles,
    "NativeBase.IconNB": basicTextStyles
  })
}
