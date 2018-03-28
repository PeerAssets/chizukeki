export function mergeByShortId(balances: Array<any>){
  return Object.values(
    balances.reduce((shortIdMap, { short_id, ...balance }) => {
      let { _raw = [], value = 0 } = shortIdMap[short_id] || {}
      shortIdMap[short_id] = {
        short_id,
        value: value + balance.value,
        _raw: [ ..._raw, balance ]
      }
      return shortIdMap
    },
    <Record<string, any>>{
    })
  )
}

