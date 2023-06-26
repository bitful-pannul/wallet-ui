export interface PendingSignedMessage {
  hash: string, // @ux
  address: string, // @ux
  domain: string, // @ux
  origin: string, // agent name
  type: {
    salt: string, // @ud
    ship: string, // @p
  }
}

export interface PendingSigned {
  [hash: string]: PendingSignedMessage
}
