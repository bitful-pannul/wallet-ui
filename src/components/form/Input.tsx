import React from 'react'
import Col from '../spacing/Col'
import './Input.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  containerStyle?: React.CSSProperties
}

const Input: React.FC<InputProps> = ({
  label,
  containerStyle,
  ...props
}) => {
  const isCheckbox = props.type === 'checkbox'
  const checkboxStyle: any = isCheckbox ? { flexDirection: 'row-reverse', justifyContent: 'flex-end', alignItems: 'flex-end' } : {}

  return (
    <Col className="input-container" style={{ ...containerStyle, ...checkboxStyle }}>
      {!!label && <label style={{ fontSize: 14, marginBottom: isCheckbox ? -2 : 0 }}>{label}</label>}
      <input type="text" {...props} className={`input ${props.className || ''}`} />
    </Col>
  )
}

export default Input
