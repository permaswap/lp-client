import BN from 'bignumber.js'

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
