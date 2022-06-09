import BigNumber from 'bignumber.js'
import { toBN } from './util'

export const getLowSqrtPrice = (lowPrice: string | BigNumber): string => {
  return toBN(lowPrice).sqrt().toString()
}

export const getCurrentSqrtPrice = (currentPrice: string | BigNumber): string => {
  return toBN(currentPrice).sqrt().toString()
}

export const getHighSqrtPrice = (highPrice: string | BigNumber): string => {
  return toBN(highPrice).sqrt().toString()
}

interface GetAmountXYResult {
  amountX: string
  amountY: string
}

export const getAmountXY = (liquidity: string, lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string): GetAmountXYResult => {
  let amountX, amountY
  if (lowSqrtPrice === currentSqrtPrice) {
    amountX = toBN(liquidity).times(
      toBN(1).dividedBy(currentSqrtPrice).minus(toBN(1).dividedBy(highSqrtPrice))
    )
    amountY = toBN(0)
  } else if (highSqrtPrice === currentSqrtPrice) {
    amountX = toBN(0)
    amountY = toBN(liquidity).times(toBN(currentSqrtPrice).minus(lowSqrtPrice))
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  } else if (toBN(lowSqrtPrice).lt(toBN(currentSqrtPrice)) && toBN(highSqrtPrice).gt(toBN(currentSqrtPrice))) {
    amountX = toBN(liquidity).times(
      toBN(1).dividedBy(currentSqrtPrice).minus(toBN(1).dividedBy(highSqrtPrice))
    )
    amountY = toBN(liquidity).times(toBN(currentSqrtPrice).minus(lowSqrtPrice))
  } else {
    return {
      amountX: '',
      amountY: ''
    }
  }
  // 向上取整
  return {
    amountX: amountX.plus(1).toFixed(0, 0),
    amountY: amountY.plus(1).toFixed(0, 0)
  }
}

interface GetAmountYAndLiquidityResult {
  liquidity: string
  amountY: string
}

export const getAmountYAndLiquidity = (lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, amountX: string): GetAmountYAndLiquidityResult => {
  // 向下取整
  const liquidity = toBN(amountX).times(currentSqrtPrice).times(highSqrtPrice)
    .dividedBy(toBN(highSqrtPrice).minus(currentSqrtPrice)).toFixed(0, 1)
  const { amountY } = getAmountXY(liquidity, lowSqrtPrice, currentSqrtPrice, highSqrtPrice)

  return {
    liquidity,
    amountY
  }
}

interface GetAmountXAndLiquidityResult {
  liquidity: string
  amountX: string
}
export const getAmountXAndLiquidity = (lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, amountY: string): GetAmountXAndLiquidityResult => {
  const liquidity = toBN(amountY).dividedBy(toBN(currentSqrtPrice).minus(lowSqrtPrice)).toFixed(0, 1)
  const { amountX } = getAmountXY(liquidity, lowSqrtPrice, currentSqrtPrice, highSqrtPrice)
  return {
    liquidity,
    amountX
  }
}

interface swapXResult {
  amountOutY: string
  newCurrentSqrtPrice: string
  fee: string
}
export const swapX = (amountInX: string,
  lowSqrtPrice: string,
  currentSqrtPrice: string,
  highSqrtPrice: string,
  liquidity: string,
  feeRatio: string
): swapXResult => {
  let fee = toBN(amountInX).times(feeRatio)
  if (fee.toFixed(0, 1) === '0') {
    throw new Error('amountInX too small')
  }
  fee = fee.plus(1)
  const amountInX2 = toBN(amountInX).minus(fee)
  const c = toBN(amountInX2).dividedBy(liquidity).plus(toBN(1).dividedBy(currentSqrtPrice))
  const newCurrentSqrtPrice = toBN(1).dividedBy(c)
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (newCurrentSqrtPrice.lt(lowSqrtPrice)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`out of range: ${newCurrentSqrtPrice.toString()} < ${lowSqrtPrice}`)
  }
  const amountOutY = toBN(liquidity).times(toBN(currentSqrtPrice).minus(newCurrentSqrtPrice))
  return {
    amountOutY: amountOutY.toFixed(0, 0),
    newCurrentSqrtPrice: newCurrentSqrtPrice.toString(),
    fee: fee.toFixed(0, 1)
  }
}

interface swapYResult {
  amountOutX: string
  newCurrentSqrtPrice: string
  fee: string
}

export const swapY = (
  amountInY: string,
  lowSqrtPrice: string,
  currentSqrtPrice: string,
  highSqrtPrice: string,
  liquidity: string,
  feeRatio: string
): swapYResult => {
  let fee = toBN(amountInY).times(feeRatio)
  if (fee.toFixed(0, 1) === '0') {
    throw new Error('amountInY too small')
  }
  fee = fee.plus(1)
  const amountInY2 = toBN(amountInY).minus(fee)
  const newCurrentSqrtPrice = toBN(amountInY2).dividedBy(liquidity).plus(currentSqrtPrice)
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (newCurrentSqrtPrice.gt(highSqrtPrice)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`out of range: ${newCurrentSqrtPrice.toString()} > ${highSqrtPrice}`)
  }
  const amountOutX = toBN(liquidity).times(toBN(1).dividedBy(currentSqrtPrice).minus(toBN(1).dividedBy(newCurrentSqrtPrice)))
  return {
    newCurrentSqrtPrice: newCurrentSqrtPrice.toString(),
    amountOutX: amountOutX.toFixed(0, 0),
    fee: fee.toFixed(0, 1)
  }
}
