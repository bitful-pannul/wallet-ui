import React from 'react'
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from '../../utils/colors';

interface HexIconProps extends React.HTMLAttributes<HTMLDivElement> {
  hexNum: string
  size?: number | string
}

const HexIcon = ({ hexNum, size = '1em', ...props }: HexIconProps) => {
  let num = hexNum
  num = num.replace(/(0x|\.)/g,'')
  
  while (num.length < 6)
  {
    num = '0' + num
  }

  const leftHsl = rgbToHsl(hexToRgb(num.slice(0, 6)))
  const rightHsl = rgbToHsl(hexToRgb(num.length > 6 ? num.slice(num.length - 6) : num))
  leftHsl.s = rightHsl.s = 1
  const leftColor = rgbToHex(hslToRgb(leftHsl))
  const rightColor = rgbToHex(hslToRgb(rightHsl))
  const angle = (parseInt(num, 16) % 360) || -45

  return (
    <div {...props} className={`color-dot ${props.className}`} style={{
      borderTopColor: leftColor,
      borderRightColor: rightColor,
      borderBottomColor: rightColor,
      borderLeftColor: leftColor,
      cursor: 'pointer',
      background: `linear-gradient(${angle}deg, ${leftColor} 0 50%, ${rightColor} 50% 100%)`,

      borderRadius: 999,
      outline: '1px solid black',
      height: size,
      minHeight: '1em',
      width: size,
      minWidth: '1em',
      margin: '0.5em',
      alignSelf: 'flex-start',
      ...props.style,
    }} />
  )
}

export default HexIcon
