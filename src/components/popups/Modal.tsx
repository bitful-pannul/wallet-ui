import React, { MouseEvent, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa'

import './Modal.scss'

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean
  hide: () => void
  hideClose?: boolean
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  show,
  hide,
  hideClose = false,
  ...props
}) => {
  const dontHide = (e: MouseEvent) => {
    e.stopPropagation()
  }
 
  if (!show) {
    return null
  }

  return (
    <div className={`modal ${show ? 'show' : ''}`} onClick={hide}>
      <div {...props} className={`content ${props.className || ''}`} onClick={dontHide}>
        {!hideClose && (
          <FaPlus className='close' onClick={hide} />
        )}
        <div style={{ height: '100%' }} onClick={dontHide}>{props.children}</div>
      </div>
    </div>
  )
}

export default Modal
