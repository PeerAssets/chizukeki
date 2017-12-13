export function nestedStyles(styles) {
  console.log(styles)
  return Object.keys(styles)
    .reduce((result, attr) => ({
      [`${attr}Style`]: styles[attr],
      ...result
    }), {})
}

const styleProps ={
  text: new Set([
    'textShadowOffset',
    'color',
    'fontSize',
    'fontStyle',
    'fontWeight',
    'lineHeight',
    'textAlign',
    'textDecorationLine',
    'textShadowColor',
    'fontFamily',
    'textShadowRadius',
    'includeFontPadding',
    'textAlignVertical',
    'fontVariant',
    'letterSpacing',
    'textDecorationColor',
    'textDecorationStyle',
    'writingDirection'
  ]),
  view: new Set([
    'borderRightColor',
    'backfaceVisibility',
    'borderBottomColor',
    'borderBottomEndRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderBottomStartRadius',
    'borderBottomWidth',
    'borderColor',
    'borderEndColor',
    'borderLeftColor',
    'borderLeftWidth',
    'borderRadius',
    'backgroundColor',
    'borderRightWidth',
    'borderStartColor',
    'borderStyle',
    'borderTopColor',
    'borderTopEndRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderTopStartRadius',
    'borderTopWidth',
    'borderWidth',
    'opacity',
    'elevation',
  ])
}

function isStyleObj(obj): boolean {
  for (let key in obj) {
    if (styleProps.text.has(key) || styleProps.view.has(key)){
      return true
    }
  }
  return false
}

function filterObj(obj: Object, set: Set<string>){
  return Object.keys(obj)
    .filter(k => set.has(k))
    .reduce((result, k) => {
      result[k] = obj[k]
      return result
    }, {})
}

function splitStyles(
  styles,
  { text, view }: { text: string, view: string } = { text: 'text', view: 'view' }
){
  return {
    [text]: filterObj(styles, styleProps.text),
    [view]: filterObj(styles, styleProps.view)
  }
}
