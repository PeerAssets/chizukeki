import { reverse } from 'ramda'
/*
  https://github.com/PeerAssets/rfcs/blob/master/0001-peerassets-transaction-specification.proto#L18-L31
*/
enum IssueModeEncoding {

  // No issuance allowed
  NONE         = 0x00,

  // Not specified, custom client implementation needed
  CUSTOM       = 0x01,

  // Only one issuance transaction from asset owner allowed
  ONCE         = 0x02,

  // Multiple issuance transactions from asset owner allowed
  MULTI        = 0x04,

  // All card transaction amounts are equal to 1
  MONO         = 0x08,

  // No card transfer transactions allowed except for the card-issue transaction
  UNFLUSHABLE  = 0x10,

  // 0x20 used by SUBSCRIPTION (0x34 = 0x20 | 0x04 | 0x10)
  // An address is subscribed to a service for X hours since the first received cards.
  // Where X is the asset balance of the address.
  // This mode automatically enables MULTI & UNFLUSHABLE (0x34 = 0x20 | 0x04 | 0x10)
  SUBSCRIPTION = 0x34,

  // SINGLET is a combination of ONCE and MONO (0x02 | 0x08)
  // Singlet deck, one MONO card issunce allowed
  SINGLET      = 0x0a,

}

enum IssueMode {
  NONE         = 'NONE',
  CUSTOM       = 'CUSTOM',
  ONCE         = 'ONCE',
  MULTI        = 'MULTI',
  MONO         = 'MONO',
  UNFLUSHABLE  = 'UNFLUSHABLE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  SINGLET      = 'SINGLET',
}

const _Modes = [
  // IssueModeEncoding.NONE, not included 
  IssueModeEncoding.CUSTOM,
  IssueModeEncoding.ONCE,
  IssueModeEncoding.MULTI,
  IssueModeEncoding.MONO,
  IssueModeEncoding.UNFLUSHABLE,
  IssueModeEncoding.SUBSCRIPTION,
  IssueModeEncoding.SINGLET,
]

namespace IssueMode {
  export type Encoding = IssueModeEncoding
  export const Encoding = IssueModeEncoding
  export const encodingToNameMap = {
    [Encoding.NONE]         : IssueMode.NONE,
    [Encoding.CUSTOM]       : IssueMode.CUSTOM,
    [Encoding.ONCE]         : IssueMode.ONCE,
    [Encoding.MULTI]        : IssueMode.MULTI,
    [Encoding.MONO]         : IssueMode.MONO,
    [Encoding.UNFLUSHABLE]  : IssueMode.UNFLUSHABLE,
    [Encoding.SUBSCRIPTION] : IssueMode.SUBSCRIPTION,
    [Encoding.SINGLET]      : IssueMode.SINGLET,

  }
  export const nameToEncodingMap = {
    [IssueMode.NONE]         : Encoding.NONE,
    [IssueMode.CUSTOM]       : Encoding.CUSTOM,
    [IssueMode.ONCE]         : Encoding.ONCE,
    [IssueMode.MULTI]        : Encoding.MULTI,
    [IssueMode.MONO]         : Encoding.MONO,
    [IssueMode.UNFLUSHABLE]  : Encoding.UNFLUSHABLE,
    [IssueMode.SUBSCRIPTION] : Encoding.SUBSCRIPTION,
    [IssueMode.SINGLET]      : Encoding.SINGLET,

  }
  export function encode(modeName: IssueMode){
    return nameToEncodingMap[modeName]
  }
  export function decode(modeEncoding: Encoding | number){
    let modes: IssueMode | IssueMode[] = encodingToNameMap[modeEncoding]
    console.log(modes)
    if (!modes) {
    
      modes = reverse( // reverse twice so SUBSCRIPTION and SINGLET absorb their sub-modes
        reverse(_Modes)
          .filter(modeBits => {
            let included = Boolean((modeBits & modeEncoding) === modeBits)
            if (included) {
              modeEncoding = modeEncoding ^ modeBits // remove bits from encoding for combos
            }
            console.log(modeEncoding)
            return included
          })
          .map(mode => encodingToNameMap[mode])
        )
      if (!modes.length) {
        modes = IssueMode.NONE
      }
    }
    return modes
  }

}
Object.assign(window, { IssueModeEncoding })

export default IssueMode
