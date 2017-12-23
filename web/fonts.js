import FontAwesome from 'react-native-vector-icons/Fonts/FontAwesome.ttf';
import Ionicons from 'react-native-vector-icons/Fonts/Ionicons.ttf';
import Roboto from 'native-base/Fonts/Roboto.ttf';
import Roboto_medium from 'native-base/Fonts/Roboto_medium.ttf';

function font(family, url){
  return `@font-face {
    src: url(${url});
    font-family: ${family};
  }`
}
function fonts(fontObj){
  return Object.entries(fontObj)
    .reduce((faces, [family, url]) => `${faces}\n${font(family, url)}`,'')
}

function injectFonts (){
  const iconFontStyles = fonts({ FontAwesome, Ionicons, Roboto, Roboto_medium })
  // Create stylesheet
  const style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }

  // Inject stylesheet
  document.head.appendChild(style);
}

export default injectFonts