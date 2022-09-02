import BN from 'bignumber.js'
import isString from 'lodash/isString'

BN.config({
  EXPONENTIAL_AT: 1000
})

export const toBN = (x: number | string | BN): BN => {
  if (isNaN(Number(x))) return new BN(0)
  if (x instanceof BN) return x

  if (typeof x === 'string') {
    if (x.indexOf('0x') === 0 || x.indexOf('-0x') === 0) {
      return new BN((x).replace('0x', ''), 16)
    }
  }
  return new BN(x)
}

export const fromUnitToDecimalBN = (x: number | string | BN, decimals: number): BN => {
  return toBN(x).times(toBN(10).pow(decimals))
}

export const fromUnitToDecimal = (x: number | string | BN, decimals: number): string => {
  return fromUnitToDecimalBN(x, decimals).toString()
}

export const fromDecimalToUnitBN = (x: number | string | BN, decimals: number): BN => {
  return toBN(x).dividedBy(toBN(10).pow(decimals))
}

export const fromDecimalToUnit = (x: number | string | BN, decimals: number): string => {
  return fromDecimalToUnitBN(x, decimals).toString()
}

export const getTimestamp = (): number => Math.round(Date.now() / 1000)

export const isInRange = (currentPrice: string, lowPrice: string, highPrice: string): boolean => {
  let lowInRange = false
  let highInRange = false
  if (lowPrice === '0' || toBN(currentPrice).gte(lowPrice)) {
    lowInRange = true
  }
  if (highPrice === '∞' || toBN(currentPrice).lte(highPrice)) {
    highInRange = true
  }
  return lowInRange && highInRange
}

export const formatInputPrecision = (amount: string, precision: number): string => {
  if (amount === '' || amount === undefined || amount === null) return ''
  if (amount === '0') return '0'
  if (isString(amount) && !amount.includes('.')) return amount

  if (isString(amount) && amount.includes('.')) {
    const amountArr = amount.split('.')
    if (amountArr[1].length > precision) {
      if (precision > 0) {
        return `${amountArr[0]}.${amountArr[1].slice(0, precision)}`
      } else {
        return `${amountArr[0]}`
      }
    }
  }
  return amount
}

export const checkParentsHas = (classname: string) => {
  return (node: HTMLElement | null) => {
    while (node != null) {
      if (node?.classList?.contains(classname)) {
        return true
      }
      node = node.parentNode as HTMLElement | null
    }
    return false
  }
}
