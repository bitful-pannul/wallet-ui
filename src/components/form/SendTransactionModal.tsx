import React, { useCallback, useEffect, useState } from 'react'
import SendTransactionForm from './SendTransactionForm'
import Modal, { ModalProps } from '../popups/Modal'
import { useWalletStore } from '../../store/walletStore'
import { watchTabClose } from '../../utils/nav'
 
import './SendTransactionModal.css'
import { SendFormField, SendFormType } from '../../types/Forms'
import { BLANK_FORM_VALUES } from '../../utils/constants'

interface SendTransactionModalProps extends ModalProps {
  id?: string
  from?: string
  nftIndex?: number
  formType?: SendFormType
  show: boolean
  title: string
  unsignedTransactionHash: string
  hide: () => void
  onSubmit: () => void
}

const SendTransactionModal = ({
  id = '',
  from = '',
  nftIndex,
  show,
  formType,
  title,
  unsignedTransactionHash,
  hide,
  onSubmit,
}: SendTransactionModalProps) => {
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
      <SendTransactionForm
        {...{ id, nftIndex, formType, from, formValues, setFormValue, setFormValues, onSubmit, unsignedTransactionHash, onDone: hide }}
      />
    </Modal>
  )
}

export default SendTransactionModal
