// React.HTMLProps<HTMLButtonElement>
import React from 'react'
import classNames from 'classnames'
import './Button.css'

export type ButtonVariant = 'dark' | 'unstyled' | undefined

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant 
  icon?: JSX.Element
  iconOnly?: boolean
  dark?: boolean
  small?: boolean
  wide?: boolean
  xwide?: boolean
  fullWidth?: boolean
  mr1?: boolean
  mb1?: boolean
  mt1?: boolean
  expander?: boolean
}

const Button: React.FC<any> = ({
  variant,
  icon,
  iconOnly = false,
  type,
  dark,
  small,
  wide,
  xwide,
  fullWidth,
  style,
  mr1,
  mb1,
  mt1,
  expander,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`button ${variant || ''} ${classNames( {
        dark, small, wide, xwide, fullWidth, mr1, mt1, mb1, expander, iconOnly
      })} ${props.className || ''}`}
      type={type || "button"}
      style={{ justifyContent: 'space-evenly', ...style }}
    >
      {icon}
      {!iconOnly && props.children}
    </button>
  )
}

export default Button
