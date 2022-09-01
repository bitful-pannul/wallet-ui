import React from 'react'
import './Text.scss'

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  mono?: boolean,
  breakWord?: boolean,
  bold?: boolean,
}

const Text: React.FC<TextProps> = ({
  mono,
  bold,
  breakWord,
  ...props
}) => {
  return (
    <span {...props} className={`text ${props.className || ''} ${mono ? 'mono' : ''} ${breakWord ? 'break' : ''} ${bold ? 'bold' : ''}`} >
      {props.children}
    </span>
  )
}

export default Text
