
type Provider = <V extends string>(v: Variant<V>) => V

namespace Provider {

  export function is<V extends string>(v: V | Provider): v is Provider {
    return typeof v === "function"
  }

  function fromGenerator(gen: IterableIterator<string>) {
    return <V extends string>(variant: Variant<V>) => {
      let v = gen.next()
      if (variant.is(v)) {
        return v
      }
      throw Error('could not provision')
    }
  }

  type Tokenizer<Source extends any = any> = (value: Source) => IterableIterator<string>
  type TokenProvider<Source> = {
    (source: Source): Provider
    to<Return>(wrapped: (p: Provider) => Return): (source: Source) => Return
  }

  export function from<Source>(tokenizer: Tokenizer<Source>) {
    function provider(source: Source){
      return fromGenerator(tokenizer(source))
    }
    let p = <TokenProvider<Source>>provider
    function to<Return>(wrapped: (p: Provider) => Return){
      return (source: Source) => wrapped(p(source)) as Return
    }
    p.to = to
    return p
  }

}

type Block<V extends string, Return> = (v: V | Provider) => Return
namespace Block {
  export function is<V extends string, Return>(r: Return | Block<V, Return>): r is Block<V, Return> {
    return typeof r === "function"
  }
}

type Case<V extends string, Return> = Return | Block<V, Return>

type Cases<V extends string, Return> = Record<V, Case<V, Return>>



class Variant<V extends string> {
  constructor(public options: Array<V>){ } is(v: any): v is V {
    return this.options.includes(v)
  }
  switch<Return extends any = any>(cases: Cases<V, Return>): (v: V) => Return {
    return v => {
      let r: Case<V, Return> = cases[v]
      return Block.is(r) ? r(v) : r
    }
  }
  pswitch<Return extends any = any>(cases: Cases<V, Return>): (provider: Provider) => Return {
    return provider => {
      let r: Case<V, Return> = cases[provider<V>(this)]
      return Block.is(r) ? r(provider) : r
    }
  }
}

function* slugConsumer(slug: string){
  for(let token of slug.split('/')){
    yield token
  }
}

let User = new Variant(['login'])
let Domains = new Variant(['user'])
const match = Provider
    .from(slugConsumer)
    .to(
      Domains.pswitch({
        user: User.pswitch({
          login: 'login!',
        })
      })
    )

let foo = 'user/login'
let s = match(foo)

let v = new Variant(['a', 'b', 'c'])
v.switch({
  a: 'a',
  b: 'b'
})

import actionCreatorFactory from 'typescript-fsa'
const actionCreator = actionCreatorFactory();
const somethingHappened = actionCreator<{foo: string}>('SOMETHING_HAPPENED');
