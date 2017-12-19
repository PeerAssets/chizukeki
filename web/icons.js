/*
 * react-native-vector-icons
 */

// Generate required css
import iconFont from 'react-native-vector-icons/Fonts/FontAwesome.ttf';

function bootstrap (){
  const iconFontStyles = `@font-face {
    src: url(${iconFont});
    font-family: FontAwesome;
  }`;

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
export default bootstrap