import React from 'react'
import './Form.css'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
}

const Form: React.FC<FormProps> = ({
  ...props
}) => {
  return (
    <form {...props} className={`form ${props.className || ''}`}>
      {props.children}
    </form>
  )
}

export default Form
