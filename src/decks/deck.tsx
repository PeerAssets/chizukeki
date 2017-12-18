import * as React from 'react'
import { Dimensions, View, Text } from 'react-native'
import { Button, RkCard, RkText, RkButton, RkStyleSheet } from 'react-native-ui-kitten'

//http://172.104.159.149:5555/api/v1/decks/

namespace Deck {
  export type Data = {
    decimals: number,
    id: string,
    issue_mode: number, 
    issuer: string,
    name: string,
    subscribed: boolean
  }
}

let RkView = (View as any)

function Wallet({}: Deck.Data) {
  return (
    <RkCard style={styles.card}>
      <RkView rkCardHeader style={styles.row}>
        <RkText rkType='header4'>Address: {address}</RkText>
      </RkView>
      <RkView rkCardContent style={styles.row}>
      </RkView>
      <RkView rkCardContent style={[styles.row, { paddingVertical: 8 }]}>
        <RkButton rkType='clear link' style={styles.leftButton}>
          Export
        </RkButton>
      </RkView>
    </RkCard>
  )
}

let styles = RkStyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.screen.scroll,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  card: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  row: {
    flexDirection: 'row',
    borderColor: theme.colors.border.base,
    borderBottomWidth: 1,
  },
  column: {
    justifyContent: 'center',
    textAlign: 'center',
    flex: 1,
  },
  separator: {
    backgroundColor: theme.colors.border.base,
    alignSelf: 'center',
    flexDirection: 'row',
    flex: 0,
    width: 1,
    height: 42
  },
  leftButton: {
    flex: 1,
    alignSelf: 'center',
    color: theme => theme.colors.primary,
  },

}))


export default Wallet
