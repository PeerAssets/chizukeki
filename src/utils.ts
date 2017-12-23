import EStyleSheet from 'react-native-extended-stylesheet'

export function objectFromEntries(entries: Array<[string, any]>){
  let obj: object = {}
  for (let [ key, value ] of entries){
    obj[key] = value
  }
  return obj
}

export function mapEntries(obj: object, fn: (entry: [ string, any ]) => [ string, any ]){
  return objectFromEntries(Object.entries(obj).map(fn))
}

type StyleSheet = {
  [styleName: string]: object
}

type ComponentStyles = {
  [component: string]: StyleSheet
}

export function ComponentStyles(styles: ComponentStyles){
  return mapEntries(styles, ([ component, sheet ]) => [ component, EStyleSheet.create(sheet) ])
}