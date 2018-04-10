import color from 'color'
import { Platform } from 'react-native'
import deepmerge from 'deepmerge'
import { getTheme, variables as nbVariables } from 'native-base'

let textStyles = {
  '.bounded': {
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    //overflow: 'hidden',
    //textOverflow: 'ellipsis',
  }
}

let assetStyles = variables => {
  let column = {
    '.column': {
      flex: 1,
      paddingTop: 5,
      marginRight: 15,
    },
    '.collapsing': {
      minWidth: 250,
    },
  }
  let typeBackgrounds = (background) => ({
    'NativeBase.Text': {
      '.name': {
        backgroundColor: color(background).lighten(0.5).hex(),
      },
      '.value': {
        backgroundColor: color(background).lighten(0.25).hex(),
      },
      '.type': {
        backgroundColor: background,
      }
    }
  })
  return {
    'NativeBase.Card': {
      'NativeBase.Body': {
        'NativeBase.CardItem': {
          // summary & detail
          '.balance': {
            padding: 0,
            paddingBottom: 10,
            'NativeBase.Text': {
              paddingTop: 5,
              paddingBottom: 5,
              '.name': {
                flex: 2,
                fontSize: 400,
                paddingLeft: 10,
                borderTopLeftRadius: 3,
                borderBottomLeftRadius: 3,
              },
              '.value': {
                flex: 1,
                textAlign: 'center'
              },
              '.type': {
                flex: 1,
                color: variables.brandLight,
                borderTopRightRadius: 3,
                borderBottomRightRadius: 3,
                textAlign: 'center',
                paddingRight: 10,
              },
            },
          },
          '.focused': {
            'NativeBase.Text': {
              '.name': {
                fontSize: 20
              }
            },
          },
          '.unissued': typeBackgrounds(variables.btnWarningBg),
          '.issued': typeBackgrounds(variables.btnSuccessBg),
          '.received': typeBackgrounds(variables.btnInfoBg),
        }
      },
      'NativeBase.CardItem': {
        'NativeBase.Body': {
          '.row': {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            flexWrap: 'wrap',
            'NativeBase.Item': {
              ...column,
              '.underlined': {
                borderBottomWidth: variables.borderWidth * 2,
                borderBottomColor: variables.inputBorderColor,
              },
            },
            'NativeBase.Text': column,
            'NativeBase.H2': column,
            'NativeBase.H3': column,
          },
          '.underlined': {
            borderBottomWidth: variables.borderWidth * 2,
            borderBottomColor: variables.inputBorderColor,
          },
        }
      }
    }
  }
}


export default (variables = nbVariables) => {
  let badgeStyles = {
    ".light": {
      backgroundColor: variables.brandLight,
      'NativeBase.Text': {
        color: variables.brandDark,
      }
    },
  }

  let buttonStyles = {
    '.iconLeft': {
      'NativeBase.Spinner': {
        marginRight: 0,
        marginLeft: 16,
      },
    },
  }

  const spinnerStyles = {
    '.inverse': {
      color: variables.inverseSpinnerColor
    },
    '.inline': {
      color: variables.textColor,
    },
  }
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
    "NativeBase.Text": Object.assign(textStyles, basicTextStyles),
    "NativeBase.Item": {
      '.stacked': {
        flexDirection: 'column',
        alignItems: 'flex-start',
        'NativeBase.Label': {
          fontSize: '14px'
        },
        'NativeBase.Input': {
          lineHeight: 14,
          textOverflow: 'ellipsis',
          width: '100%',
          height: 40
        }
      }
    },
    "NativeBase.Icon": basicTextStyles,
    "NativeBase.IconNB": basicTextStyles,
    "NativeBase.Button": buttonStyles,
    "NativeBase.Badge": badgeStyles,
    "NativeBase.Spinner": Object.assign(spinnerStyles, basicTextStyles),

    'PeerKeeper.Assets': assetStyles(variables),
    'PeerKeeper.Asset': assetStyles(variables)
  })
}
