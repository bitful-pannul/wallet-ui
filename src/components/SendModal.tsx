import React, { useCallback, useEffect, useState } from 'react'
import SendTransactionForm from './form/SendTransactionForm'
import Modal, { ModalProps } from './popups/Modal'
import { useWalletStore } from '../store/walletStore'
import { watchTabClose } from '../utils/nav'
import { BLANK_FORM_VALUES } from '../utils/constants'
import { SendFormField, SendFormType } from '../types/Forms'
 
import './SendModal.css'

interface SendModalProps extends ModalProps {
  id?: string
  from?: string
  nftIndex?: number
  formType?: SendFormType
  show: boolean
  title: string
  unsignedTransactionHash?: string
  onSubmit?: () => void
  hide: () => void
}

const SendModal = ({
  id = '',
  from = '',
  nftIndex,
  show,
  formType,
  title,
  unsignedTransactionHash,
  onSubmit,
  hide,
}: SendModalProps) => {
  const { mostRecentTransaction: txn } = useWalletStore()
  const [formValues, setFormValues] = useState(BLANK_FORM_VALUES)

  useEffect(() => {
    if (show) watchTabClose()
  }, [show])

  const setFormValue = useCallback((key: SendFormField, value: string) => {
    const newValues = { ...formValues }
    newValues[key] = value
    setFormValues(newValues)
  }, [formValues, setFormValues])

  const hideModal = useCallback(() => {
    hide();
    setFormValues(BLANK_FORM_VALUES)
  }, [hide, setFormValues])

  return (
    <Modal 
      title={title}
      show={show} 
      hide={hideModal}
      style={{ width: '40%', minWidth: 350 }}
      className='send-view'
    >
      <SendTransactionForm {...{ id, nftIndex, formType, from, formValues, setFormValue, setFormValues, onDone: hide, onSubmit, unsignedTransactionHash }} />
    </Modal>
  )
}

export default SendModal
