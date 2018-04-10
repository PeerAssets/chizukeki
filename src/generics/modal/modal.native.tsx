import * as React from 'react'
import { Modal } from 'react-native'

export default ({ open, onClose, ...props }) =>  (
  <Modal
    transparent={false}
    visible={this.state.modalVisible}
    onRequestClose={onClose}
    {... { onDismiss: onClose }} // type issue
    {...props} />
)