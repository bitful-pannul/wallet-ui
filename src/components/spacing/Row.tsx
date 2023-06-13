import React from 'react'
import './Row.css'
import classNames from 'classnames'

interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  between?: boolean,
  evenly?: boolean,
  reverse?: boolean,
  fullWidth?: boolean
}

const Row = ( { between, evenly,  reverse, fullWidth, ...props }: any ) => {
  return (
    <div {...props} className={`row ${props.className || ''} ${classNames({ between, evenly, reverse, w100: fullWidth })}`}>
      {props.children}
    </div>
  )
}

export default Row
