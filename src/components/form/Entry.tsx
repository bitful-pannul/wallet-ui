import React from 'react'
import Col from '../spacing/Col';
import Divider from '../spacing/Divider';
import Row from '../spacing/Row';
import './Entry.scss'

interface EntryProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  divide? : boolean
}

const Entry: React.FC<EntryProps> = ({ className = '', children, divide = false, ...rest }) => {
  return (
    <>
      <Col className={`entry ${divide ? 'divide' : ''} ${className}`} {...rest}>
        {children}
      </Col>
      { divide && <Divider />}
    </>
  )
}

export default Entry
