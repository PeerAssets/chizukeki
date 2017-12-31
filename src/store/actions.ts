
type Creator<T, P> = (payload: P) => { type: T, payload: P }

function Creator<T, P>(type: T): Creator<T, P> {
  return (payload: P) => ({ type, payload })
}

namespace Creator {
  export type Empty<T> = () => { type: T }
  export function Empty<T>(type: T): Empty<T> {
    return () => ({ type })
  }
}

class Action<Tuple extends Array<string>, Payload extends any = null> {
  type: string
  constructor(public tuple: Tuple, creatorType){
    this.type = tuple.join('/')
  }
  creator(){
  }
  valueOf(){
    return this.tuple
  }
}

type NotFunction = object | string | boolean | number
type Block<Return> = () => Return
function isBlock<Return>(r: Return | Block<Return>): r is Block<Return> {
  return typeof r === "function"
}

type Cases<Tuple, Return extends NotFunction = object> = Array<[
  Tuple,
  Return | Block<Return>
]>

function equals(a, b){
  return JSON.stringify(a) === JSON.stringify(b)
}

/*
 *  Build a switch that keys off of tuples with a required default case
 *  type Tuple = ['a' | 'b' | 'c', '1' | '2' | '3' ]
 *  let cases = [
 *    [ ['a', '1'], () => 'a1' ],
 *    [ ['b', '2'], 'b2' ],
 *  ]
 *  let defaultCase = 'default'
 *  Switch<Tuple, 'a1' | 'b2' | 'default'>(['a', '1']) //=> 'a1'
 *  // TODO:  cache stringified tuples
 */

function Switch<Tuple extends Array<string>, Return extends any = any>(
  cases: Cases<Tuple, Return>,
  defaultCase: Return | Block<Return>
) {
  return (value: Tuple | string): Return => {
    if(typeof(value) === 'string'){
      return isBlock(defaultCase) ? defaultCase() : defaultCase
    }
    for (let [ tuple, result ] of cases){
      if(equals(value, tuple)){
        return isBlock(result) ? result() : result
      }
    }
    return isBlock(defaultCase) ? defaultCase() : defaultCase
  }
}

/*
 *  Helper wrappers around the above switch that creates switch factory for the given keys
 *  DEFAULT is always required
 *  let dictSwitch = Switch.Dict({ a: ['a', '1'], b: ['b', 2] })
 *  dictSwitch({ a: 'a1', b: 'b2', DEFAULT: 'default' })(['b', 2]) //=> 'b2'
 */ 



namespace Switch {
  export function Dict<Key extends string, Tuple extends Array<string>>(mapping: Record<Key, Tuple>){

    type Default<Return> = { DEFAULT: Return | Block<Return> }
    type CaseDict<Return> = Record<Key, Return | Block<Return>>

    // D is the dictionary of cases
    function DictSwitch<Return extends any = any, D = CaseDict<Return>>(caseDict: D & Default<Return>){
      let defaultCase = caseDict.DEFAULT
      delete caseDict.DEFAULT
      let cases: Cases<Tuple, Return> = Object.entries(caseDict).map(
        ([ key, result ]) => [ mapping[key], result ] as [Tuple, Return | Block<Return>])
      return Switch<Tuple, Return>(cases, defaultCase)
    }

    type DictSwitch = {
      // The root switch is exhaustive 
      <Return extends any = any>(caseDict: CaseDict<Return> & Default<Return>),
      // All we need for a partial alternative is type casting
      partial<Return extends any = any>(caseDict: Partial<CaseDict<Return>> & Default<Return>)
    }

    let S = <DictSwitch>DictSwitch
    S.partial = <DictSwitch['partial']>DictSwitch

    return S
  }
}


class ActionAware<ActionType> {
  constructor(public history: Array<ActionType> = []){ }
  push(action: ActionType){
    return new ActionAware<ActionType>([ ...this.history, action ])
  }
  get latest(): ActionType | undefined {
    return this.history[this.history.length - 1]
  }
  valueOf(){
    return this.latest
  }
}

type BindActionHistory<ActionType> = {
  action: ActionAware<ActionType>
}


export { Creator, Switch, ActionAware }