import * as React from 'react';
import Modal from 'react-responsive-modal';

export default function WrappedModal({ showCloseIcon = false, little = true, ...props }){
    return <Modal showCloseIcon={showCloseIcon} little={little} {...props}/>
}
