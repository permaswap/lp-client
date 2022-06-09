import { toBN } from './util'

export const getLowSqrtPrice = (lowPrice: string): string => {
  return toBN(lowPrice).sqrt().toString()
}

export const getCurrentSqrtPrice = (currentPrice: string): string => {
  return toBN(currentPrice).sqrt().toString()
}

export const getHighSqrtPrice = (highPrice: string): string => {
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
  const liquidity = toBN(amountY).times(toBN(currentSqrtPrice).minus(lowSqrtPrice)).toFixed(0, 1)
  const { amountX } = getAmountXY(liquidity, lowSqrtPrice, currentSqrtPrice, highSqrtPrice)
  return {
    liquidity,
    amountX
  }
}

interface swapXResult {
  amountOutY: string
  newCurrentSqrtPrice: string
}
export const swapX = (amountInX: string, lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, liquidity: string): swapXResult => {
  const c = toBN(amountInX).dividedBy(liquidity).plus(toBN(1).dividedBy(currentSqrtPrice))
  const newCurrentSqrtPrice = toBN(1).dividedBy(c)
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (newCurrentSqrtPrice.lt(lowSqrtPrice)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`out of range: ${newCurrentSqrtPrice.toString()} < ${lowSqrtPrice}`)
  }
  const amountOutY = toBN(liquidity).times(toBN(currentSqrtPrice).minus(newCurrentSqrtPrice))
  return {
    amountOutY: amountOutY.toFixed(0, 0),
    newCurrentSqrtPrice: newCurrentSqrtPrice.toString()
  }
}

interface swapYResult {
  amountOutX: string
  newCurrentSqrtPrice: string
}

export const swapY = (amountInY: string, lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, liquidity: string): swapYResult => {
  const newCurrentSqrtPrice = toBN(amountInY).dividedBy(liquidity).plus(currentSqrtPrice)
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (newCurrentSqrtPrice.gt(highSqrtPrice)) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`out of range: ${newCurrentSqrtPrice.toString()} > ${highSqrtPrice}`)
  }
  const amountOutX = toBN(liquidity).times(toBN(1).dividedBy(currentSqrtPrice).minus(toBN(1).dividedBy(newCurrentSqrtPrice)))
  return {
    newCurrentSqrtPrice: newCurrentSqrtPrice.toString(),
    amountOutX: amountOutX.toFixed(0, 0)
  }
}
