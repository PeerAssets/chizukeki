import * as React from 'react';
import Modal from 'react-responsive-modal';

export default function WrappedModal({ little = true, ...props }){
  return <Modal little={little }{...props}/>
}