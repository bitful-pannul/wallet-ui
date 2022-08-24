import React from 'react'
import { PUBLIC_URL } from '../../utils/constants';
import './Link.scss'

interface LinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  urlPrefix?: string;
  type?: string;
  target?: string;
}

const Link: React.FC<LinkProps> = ({
  href,
  urlPrefix,
  type = '',
  ...props
}) => {
  return (
    <a href={(urlPrefix || PUBLIC_URL) + href} {...props} className={`link ${props.className || ''} ${type}`}>
      {props.children}
    </a>
  )
}

export default Link
