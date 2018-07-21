import * as React from 'react'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon, Right } from 'native-base'
import moment from 'moment'

type Props = {
  type: 'DEBIT' | 'CREDIT' | 'SELF_SEND',
  amount: number,
  timestamp: Date | string,
  addresses: Array<string>,
  asset: string | React.ReactNode,
  children?: any
}

let Address = props => (
  <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1} {...props}/>
)

class Transaction extends React.Component<Props, { showDetails: boolean }> {
  toggleDetails = () => this.setState({ showDetails: !this.state.showDetails })
  constructor(props){
    super(props)
    this.state = { showDetails: false }
  }
  typeSpecific = () => {
    switch (this.props.type) {
      case 'DEBIT':
        return {
          icon: 'arrow-circle-o-up',
          styleNames: 'dark',
          sign: '-',
          direction: 'to',
          selfSend: false
        }
      case 'CREDIT':
        return {
          icon: 'arrow-circle-o-down',
          styleNames: 'success',
          sign: '+',
          direction: 'from',
          selfSend: false
        }
      case 'SELF_SEND':
        return {
          icon: 'minus-circle',
          styleNames: 'warning',
          sign: '',
          selfSend: true
        }
    }
  }
  render() {
    let { amount, asset, timestamp, addresses, children } = this.props
    let { styleNames, icon, sign, selfSend, direction } = this.typeSpecific()
    return (
      <Card>
        <CardItem style={{ display: 'flex', flexDirection: 'row' }}>
          <Left style={{ flex: 7 }}>
            <Icon styleNames={styleNames} name={icon}
                size={30} color={'black'} />
            <Body>
              <Text styleNames={styleNames}  style={{ lineHeight: 20, paddingRight: 7 }}>
                {sign}
                {Math.abs(amount).toString()} {asset}
              </Text>
            </Body>
          </Left>
          <Right style={{ flex: 4, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', flexBasis: 20 }}>
            <Text styleNames='note' style={{ flex: 4, textAlign: 'right', height: 30, position: 'relative', bottom: 2  }}>
              {timestamp === 'pending'
                ? timestamp
                : moment(timestamp).fromNow().replace('a few ', '')}
            </Text>
            { children ? (
              <Button styleNames='transparent small dark' style={{ flex: 1, position: 'relative', left: 8, bottom: 8 }}
                onPress={this.toggleDetails} >
                <Icon name={this.state.showDetails ? 'minus' : 'plus'} />
              </Button>
            ) : null}
          </Right>
        </CardItem>
        <CardItem style={{ paddingTop: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          { selfSend && <Address>self send</Address> }
          {addresses.map((address, i) => (
            <Address key={i}>{direction} {address}</Address>
          ))}
        </CardItem>
        { this.state.showDetails ? children : null}
      </Card>
    )
  }
}

export default Transaction
