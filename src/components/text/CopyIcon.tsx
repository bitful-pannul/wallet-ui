import React, { useCallback, useState } from 'react'
import { FaRegCheckCircle, FaRegCopy, FaEthereum } from 'react-icons/fa';
import Row from '../spacing/Row'
import Text from '../text/Text';
import './CopyIcon.css'

interface CopyIconProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  eth?: boolean
  iconOnly?: boolean
}

const CopyIcon: React.FC<CopyIconProps> = ({
  text,
  eth = false,
  iconOnly = true,
  style,
  className,
  ...props
}) => {
  const [didCopy, setDidCopy] = useState(false)

  const onCopy = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const textToCopy = eth ? text.replace(/\./g, '') : text
    navigator.clipboard.writeText(textToCopy)
    setDidCopy(true)
    setTimeout(() => setDidCopy(false), 1000)
  }, [text])

  return (
    <Row style={{ marginLeft: 12, padding: '2px 4px', cursor: 'pointer', ...style }} className={`copy-icon ${className}`} onClick={onCopy}>
      {didCopy ? 
        iconOnly ? <FaRegCheckCircle />
        : <Text style={{ fontSize: 14 }}>Copied!</Text>
      : (eth ? <FaEthereum className='copy' /> : <FaRegCopy className='copy' />)}
    </Row>
  )
}

export default CopyIcon
