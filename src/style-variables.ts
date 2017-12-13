import EStyleSheet from 'react-native-extended-stylesheet'
import { Dimensions } from 'react-native';

const variables = {

  $height: () => Dimensions.get('window').height,
  $width: () => Dimensions.get('window').width,

  $theme: 'default',  // required variable for caching!

  /*---  Colors  ---*/
  $blue: '#0074D9',
  $green: '#2ECC40',
  $orange: '#FF851B',
  $pink: '#D9499A',
  $purple: '#A24096',
  $red: '#FF4136',
  $teal: '#39CCCC',
  $yellow: '#FFCB08',

  $black: '#191919',
  $grey: '#CCCCCC',
  $white: '#FFFFFF',

  /*---  Light Colors  ---*/
  $lightBlue: '#54C8FF',
  $lightGreen: '#2ECC40',
  $lightOrange: '#FF851B',
  $lightPink: '#FF8EDF',
  $lightPurple: '#CDC6FF',
  $lightRed: '#FF695E',
  $lightTeal: '#6DFFFF',
  $lightYellow: '#FFE21F',

  $primaryColor: '$teal',
  $primaryBackground: '$white',

  $secondaryColor: '$black',
  $secondaryBackground: '$teal',

  $tertiaryColor: '$purple',
  $tertiaryBackground: '$grey',


  /*-------------------
          Page
  --------------------*/
  $bodyBackground: '#FCFCFC',
  $fontSize: 14,
  $textColor: 'rgba(0, 0, 0, 0.8)',

  $highlightBackground: '#FFFFCC',
  $highlightColor: '$textColor',

}

const mixins = EStyleSheet.create({
  primary: {
    color: '$primaryColor',
    backgroundColor: '$primaryBackground',
  },
  secondary: {
    color: '$secondaryColor',
    backgroundColor: '$secondaryBackground',
  },
  tertiary: {
    color: '$tertiaryColor',
    backgroundColor: '$tertiaryBackground',
  }
})

export { variables, mixins }