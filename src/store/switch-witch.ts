type Provider = <V extends string>(v: Variant<V>) => V
namespace Provider {
  export function is<V extends string>(v: V | Provider): v is Provider {
    return typeof v === "function"
  }
  export function from(gen: IterableIterator<string>) {
    return <V extends string>(variant: Variant<V>) => {
      let v = gen.next()
      if (variant.is(v)) {
        return v
      }
      throw Error('could not provision')
    }
  }
}

type Block<V extends string, Return> = (v: V) => Return
namespace Block {
  export function is<V extends string, Return>(r: Return | Block<V, Return>): r is Block<V, Return> {
    return typeof r === "function"
  }
}

type Case<V extends string, Return> = Return | Block<V, Return>

type Cases<V extends string, Return> = Record<V, Case<V, Return>>

type Generator = <Source extends any = any>(value: Source) => IterableIterator<string>


class Variant<V extends string> {
  constructor(public options: Array<V>){ }
  is(v: any): v is V {
    return this.options.includes(v)
  }
  with(provider: Provider){
    return {
      switch<Return extends any = any>(cases: Cases<V, Return>) {
        return (ignore? : any): Return => {
          let v = provider<V>(this)
          let r: Case<V, Return> = cases[v]
          return Block.is(r) ? r(v) : r
        }
      }
    }
  }
  switch<Return extends any = any>(cases: Cases<V, Return>): (v: V) => Return {
    return v => {
      let r: Case<V, Return> = cases[v]
      return Block.is(r) ? r(v) : r
    }
  }
}

function* slugConsumer(slug: string){
  for(let token of slug.split('/')){
    yield token
  }
}


let User = new Variant(['login', 'logout'])
let Domains = new Variant(['user'])
function match(source: string = 'domain/action/state'){
  let p = Provider.from(slugConsumer('domain/action/state'))
  Domains.switch({
    user: User.with(p).switch({
      login: 'yas',
      logout: 'yas',
    })
  })
}

let structure = {}


namespace Variant {
  type Nav = <Source, Token extends string>(value: Source) => IterableIterator<Token>
//type Navigator = {
//  <N extends Nav = Nav>(caseDict: N),
//  with<Source>()
//  // All we need for a partial alternative is type casting
//  partial<Return extends any = any>(caseDict: Partial<CaseDict<Return>> & Default<Return>)
//}
  class Navigator<Source, N extends Nav> {
    constructor(public navigator: N){}
    consume(source: Source){

    }
    with(){

    }
  }

  function using<Source, N extends Nav = Nav>(nav: N){
    function consume(source: Source) {
    }
      let S = <DictSwitch>DictSwitch
      S.partial = <DictSwitch['partial']>DictSwitch

    }
  }

  function consume(: string){}

    let S = <DictSwitch>DictSwitch
    S.partial = <DictSwitch['partial']>DictSwitch

}

function* navigator(: ()){

}

namespace Slug {
  function consumer(action){

  }
}

let v = new Variant(['a', 'b', 'c'])
v.switch({
  a: 'a',
  b: 'b'
})

import actionCreatorFactory from 'typescript-fsa'
const actionCreator = actionCreatorFactory();
const somethingHappened = actionCreator<{foo: string}>('SOMETHING_HAPPENED');
