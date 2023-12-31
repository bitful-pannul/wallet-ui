export const removeDots = (str: string) => (str || '').replace(/\./g, '')

export const formatHash = (hash: string) => `${removeDots(hash).slice(0, 10)}…${removeDots(hash).slice(-8)}`

export const truncateString = (str: string) => `${removeDots(str).slice(0, 4)}…${removeDots(str).slice(-4)}`

export const addHexDots = (hex: string) => {
  const clearLead = removeDots(hex.replace('0x', '').toLowerCase()).replace(/^0+/, '')
  let result = ''

  for (let i = clearLead.length - 1; i > -1; i--) {
    if (i < clearLead.length - 1 && (clearLead.length - 1 - i) % 4 === 0) {
      result = '.' + result
    }
    result = clearLead[i] + result
  }

  return `0x${result}`
}

export const addBinDots = (bin: string) => {
  const clearLead = removeDots(bin.replace('0b', '').toLowerCase())
  let result = ''

  for (let i = clearLead.length - 1; i > -1; i--) {
    if (i < clearLead.length - 1 && (clearLead.length - 1 - i) % 4 === 0) {
      result = '.' + result
    }
    result = clearLead[i] + result
  }

  return `0b${result}`
}

export const addDecimalDots = (decimal: string | number) => {
  const num = typeof decimal === 'number' ? decimal.toString() : decimal
  const number = []
  const len = num.length;
  for (let i = 0; i < len; i++) {
    if (i !== 0 && i % 3 === 0) {
      number.push('.')
    }
    number.push(num[len - 1 - i])
  }
  return number.reverse().join('')
}

//   '@': removeDots,
//   '@da': ,
//   '@p': ,
//   '@rs': ,
//   '@t': ,
//   '@ub': ,
//   '@ud': ,
//   '@ux': ,
//   '?': ,

export const capitalize = (word?: string) => !word ? word : word[0].toUpperCase() + word.slice(1).toLowerCase()

export const addHexPrefix = (str: string) => `0x${str.replace(/^0x/i, '')}`

export const abbreviateHex = (hash: string, start: number = 4, end: number = 4) => `${removeDots(hash).slice(0, start)}…${removeDots(hash).slice(-end)}`
