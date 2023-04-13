import React from 'react'
import './Link.css'

interface CustomLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  type?: string;
  target?: string;
}

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  type = '',
  ...props
}) => {
  return (
    <a href={href} className={`link ${props.className || ''} ${type}`}>{props.children}</a> 
  )
}

export default CustomLink
