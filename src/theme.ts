import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window')

function scaleUtils() {
  const { width, height } = Dimensions.get('window');

  //Guideline sizes are based on standard ~5" screen mobile device
  const guidelineBaseWidth = 350;
  const guidelineBaseHeight = 680;

  const scale = size => width / guidelineBaseWidth * size;
  const scaleVertical = size => height / guidelineBaseHeight * size;
  const scaleModerate = (size, factor = 0.5) => size + (scale(size) - size) * factor;

  return { scale, scaleVertical, scaleModerate };
}


const { scale, scaleVertical } = scaleUtils()

const Colors = {
  accent: '#ff2824',
  primary: '#f64e59',
  success: '#3bd555',
  disabled: '#cacaca',

  foreground: '#212121',
  alterForeground: '#707070',
  inverseForeground: '#ffffff',
  secondaryForeground: '#bcbcbc',
  hintForeground: '#969696',

  background: '#ffffff',
  alterBackground: '#f2f2f2',
  overlayBackground: '#00000057',
  neutralBackground: '#f2f2f2',
  fadedBackground: '#e5e5e5',

  border: '#f2f2f2',

  twitter: '#41abe1',
  google: '#e94335',
  facebook: '#3b5998',

  gradientBaseBegin: '#ff9147',
  gradientBaseEnd: '#ff524c',
  gradientVisaBegin: '#63e2ff',
  gradientVisaEnd: '#712ec3',
  gradientMasterBegin: '#febb5b',
  gradientMasterEnd: '#f24645',
  gradientAxpBegin: '#42e695',
  gradientAxpEnd: '#3bb2bb',

  // -----
  faded: '#e5e5e5',
  icon: '#c2c2c2',
  neutral: '#f2f2f2',


  info: '#19bfe5',
  warning: '#feb401',
  danger: '#ed1c4d',

};

const Fonts = {
  light: 'Helvetica-Light',
  regular: 'Helvetica-Regular',
  bold: 'Helvetica',
  logo: 'Righteous-Regular',
};

const FontBaseValue = 18;

export const LightTheme = {
  name: 'light',
  width,
  height,
  colors: {
    accent: Colors.accent,
    primary: Colors.primary,
    disabled: Colors.disabled,
    twitter: Colors.twitter,
    google: Colors.google,
    facebook: Colors.facebook,
    brand: Colors.accent,
    text: {
      base: Colors.foreground,
      secondary: Colors.secondaryForeground,
      accent: Colors.accent,
      inverse: Colors.inverseForeground,
      hint: Colors.alterForeground,
    },
    input: {
      text: Colors.alterForeground,
      background: Colors.background,
      label: Colors.secondaryForeground,
      placeholder: Colors.secondaryForeground,
    },
    screen: {
      base: Colors.background,
      alter: Colors.alterBackground,
      scroll: Colors.alterBackground,
      bold: Colors.alterBackground,
      overlay: Colors.overlayBackground
    },
    button: {
      back: Colors.background,
      underlay: Colors.neutralBackground,
      highlight: Colors.primary
    },
    border: {
      base: Colors.border,
      accent: Colors.accent,
      secondary: Colors.secondaryForeground
    },
    control: {
      background: Colors.background
    },
  },
  fonts: {
    sizes: {
      h0: 32,
      h1: 26,
      h2: 24,
      h3: 20,
      h4: 18,
      h5: 16,
      h6: 15,
      p1: 16,
      p2: 15,
      p3: 15,
      p4: 13,
      s1: 15,
      s2: 13,
      s3: 13,
      s4: 12,
      s5: 12,
      s6: 13,
      s7: 10,
      base: FontBaseValue,
      small: FontBaseValue * .8,
      medium: FontBaseValue,
      large: FontBaseValue * 1.2,
      xlarge: FontBaseValue / 0.75,
      xxlarge: FontBaseValue * 1.6,
    },
    lineHeights: {
      medium: 18,
      big: 24
    },
    family: {
      regular: Fonts.regular,
      light: Fonts.light,
      bold: Fonts.bold,
      logo: Fonts.logo
    }
  }
};
