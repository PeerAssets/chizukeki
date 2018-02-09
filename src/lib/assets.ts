
/*
  https://github.com/PeerAssets/rfcs/blob/master/0001-peerassets-transaction-specification.proto#L18-L31
*/
enum IssueModes {

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