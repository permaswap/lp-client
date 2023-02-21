import { lpClientVerison } from '@/constants'
import BN from 'bignumber.js'
import { Token } from 'everpay'
import isString from 'lodash/isString'
import { getAmountXY } from './math'
import semver from 'semver'

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

export const isSqrtInRange = (currentSqrtPrice: string, lowSqrtPrice: string, highSqrtPrice: string): boolean => {
  let lowInRange = false
  let highInRange = false
  if (lowSqrtPrice === '0' || toBN(currentSqrtPrice).gte(toBN(lowSqrtPrice).times(1.00000001))) {
    lowInRange = true
  }
  if (highSqrtPrice === '∞' || toBN(currentSqrtPrice).lte(toBN(highSqrtPrice).times(0.99999999))) {
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

export const getAmountFromLps = (lps: any[], token: Token): string => {
  let balances = toBN(0)
  lps.forEach((lp) => {
    const { amountX, amountY } = getAmountXY(lp.lowSqrtPrice, lp.currentSqrtPrice, lp.highSqrtPrice, lp.liquidity)
    if (token.symbol === lp.tokenXSymbol) {
      balances = balances.plus(amountX)
    } else if (token.symbol === lp.tokenYSymbol) {
      balances = balances.plus(amountY)
    }
  })
  return fromDecimalToUnit(balances, token.decimals)
}

export const isValidVersion = (serverVision: string): boolean => {
  const curV = lpClientVerison.slice(1)
  const serV = serverVision.slice(1)
  return semver.gte(curV, serV)
}

/**
 * we don't use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString here
 * cause toLocalString will auto round bigNumber
 * but now we used too many times bigNumber's method, this may caused some performance problem.
 */
export const thousandCommas = (num: number | string, place: number = 4): string => {
  if (place < 0 || place > 20) {
    console.warn('max must be less than 20')
    return toBN(num).toString(10)
  }

  const n = toBN(num).toFormat(place, 1)
  /**
   *  小数位去零
   * 3.14159000 =>  3.14159
   * 3.00 => 3
   * 3.00012 => 3.00012
   * 3.0001200 => 3.00012
   * 31415 => 31,415
   */
  // return n.replace(/\.0+$/g, '').replace(/\.(.*[^0])0+$/g, '.$1'
  return n
}

// only format money
export const formatMoney = (value: number | string, place: number = 2): string => {
  return thousandCommas(value, place)
}
