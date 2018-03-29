import * as React from 'react'
import { Button, Card, Left, CardItem, Body, Text, H2, Icon, Right } from 'native-base'
import moment from 'moment'

type Props = {
  amount: number,
  timestamp: Date,
  addresses: Array<string>,
  asset: string,
  children?: any
}

class Transaction extends React.Component<Props, { showDetails: boolean }> {
  toggleDetails = () => this.setState({ showDetails: !this.state.showDetails })
  constructor(props){
    super(props)
    this.state = { showDetails: false }
  }
  render() {
    let { amount, asset, timestamp, addresses, children } = this.props
    let io = (inbound, outbound) => amount > 0 ? inbound : outbound
    let textProps = { styleNames: io('success', 'dark') }
    return (
      <Card>
        <CardItem>
          <Left>
            <Icon {...textProps} name={`arrow-circle-o-${io('down', 'up')}`} size={30} color={'black'} />
            <Body>
              <Text {...textProps}>
                {io('+', '-')}
                {amount.toString()} {asset}
              </Text>
            </Body>
          </Left>
          <Right style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text styleNames='note' style={{ flex: 6, textAlign: 'right', height: '2em', position: 'relative', bottom: 2 }}>
              {moment(timestamp).fromNow()}
            </Text>
            { children ? (
              <Button styleNames='transparent small dark' style={{ flex: 1, position: 'relative', left: 12, bottom: 5 }}
                onPress={this.toggleDetails} >
                <Icon name={this.state.showDetails ? 'minus' : 'plus'} />
              </Button>
            ) : null}
          </Right>
        </CardItem>
        <CardItem
          style={{ paddingTop: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {addresses.map((address, i) => (
            <Text styleNames='bounded note' ellipsizeMode='middle' numberOfLines={1}>
              {io('from', 'to')} {address}
            </Text>
          ))}
        </CardItem>
        { this.state.showDetails ? children : null}
      </Card>
    )
  }
}

export default Transaction