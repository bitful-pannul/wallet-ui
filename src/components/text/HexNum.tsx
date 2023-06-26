import React from 'react'
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from '../../utils/colors'
import { addHexDots } from '../../utils/format'
import CopyIcon from './CopyIcon'
import Row from '../spacing/Row'
import Text from './Text'
import HexIcon from './HexIcon'

import './HexNum.css'

interface HexNumProps extends React.HTMLAttributes<HTMLSpanElement> {
  colors?: boolean,
  num: string,
  displayNum?: string,
  mono?: boolean
  bold?: boolean
  copy?: boolean
  copyText?: string
}

const HexNum: React.FC<HexNumProps> = ({
  num,
  displayNum = num,
  bold,
  copy,
  copyText,
  colors = true,
  mono = true,
  ...props
}) => {
  copyText = copyText || displayNum

  return (
    <Row {...props} className={`hex ${props.className || ''} ${colors ? 'colors' : ''}`}>
      {colors && <HexIcon hexNum={num} />}
      <Text breakAll className='hex-text' bold={bold} mono={mono}> 
        {displayNum}
      </Text>
      {copy && <CopyIcon text={addHexDots(copyText)} />}
      {props.children}
    </Row>
  )
}

export default HexNum
