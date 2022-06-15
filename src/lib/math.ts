import Decimal from 'decimal.js'

const RoundUpDec = Decimal.clone({ precision: 32, rounding: Decimal.ROUND_UP })
const RoundDownDec = Decimal.clone({ precision: 32, rounding: Decimal.ROUND_DOWN })

const sqrtPrice = (price: string): string => {
  const Dec = Decimal.clone({ precision: 32, rounding: Decimal.ROUND_HALF_EVEN })
  return new Dec(price).sqrt().toString()
}

const getNewSqrtPriceFromAmountXRoundUp = (startSqrtPrice: string, liquidity: string, amount: string, add: boolean): string => {
  // getNextSqrtPriceFromAmount0RoundingUp: l*s/(a*s+l)
  if (add) {
    const product = RoundUpDec.mul(startSqrtPrice, liquidity)
    const product2 = RoundDownDec.mul(startSqrtPrice, amount)
    const denominator = RoundDownDec.add(product2, liquidity)
    const quotient = RoundUpDec.div(product, denominator)
    return quotient.toString()
  } else {
    return ''
  }
}

const getNewSqrtPriceFromAmountYRoundingDown = (startSqrtPrice: string, liquidity: string, amount: string, add: boolean): string => {
  // getNextSqrtPriceFromAmount1RoundingDown: a/l + s
  if (add) {
    const quotient = RoundDownDec.div(amount, liquidity)
    const sum = RoundDownDec.add(quotient, startSqrtPrice)
    return sum.toString()
  } else {
    return ''
  }
}

const swapOut = (startSqrtPrice: string, liquidity: string, amountIn: string, tokenInIsX: boolean): [string, string] => {
  // x: l * (1/s - 1/e), y: l*(s - e);
  if (tokenInIsX) {
    const endSqrtPrice = getNewSqrtPriceFromAmountXRoundUp(startSqrtPrice, liquidity, amountIn, true)
    const difference = RoundDownDec.sub(startSqrtPrice, endSqrtPrice)
    const product = RoundDownDec.mul(liquidity, difference)
    const amountOUt = product.toFixed(0, Decimal.ROUND_DOWN)
    return [amountOUt, endSqrtPrice]
  } else {
    const endSqrtPrice = getNewSqrtPriceFromAmountYRoundingDown(startSqrtPrice, liquidity, amountIn, true)
    const reciprocal = RoundDownDec.div(1, startSqrtPrice)
    const reciprocal2 = RoundUpDec.div(1, endSqrtPrice)
    const difference = RoundDownDec.sub(reciprocal, reciprocal2)
    const product = RoundDownDec.mul(liquidity, difference)
    const amountOUt = product.toFixed(0, Decimal.ROUND_DOWN)
    return [amountOUt, endSqrtPrice]
  }
}

const swap = (tokenInIsX: boolean, amountIn: string, lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, liquidity: string, feeRatio: string): [string, string, string] => {
  console.log({ tokenInIsX, amountIn, lowSqrtPrice, currentSqrtPrice, highSqrtPrice, liquidity, feeRatio })
  const fee = RoundUpDec.mul(amountIn, feeRatio)
  if (+fee.cmp(1) !== 1) {
    throw new Error('amountIn too small')
  }

  const fee2 = fee.toFixed(0, Decimal.ROUND_UP)
  const amountIn2 = RoundDownDec.sub(amountIn, fee2).toString()
  if (tokenInIsX) {
    const [amountOut, newCurrentSqrtPrice] = swapOut(currentSqrtPrice, liquidity, amountIn2, true)
    if (+(new Decimal(newCurrentSqrtPrice)).cmp(lowSqrtPrice) === -1) {
      throw new Error(`out of range: ${newCurrentSqrtPrice.toString()} < ${lowSqrtPrice}`)
    }
    return [newCurrentSqrtPrice, amountOut, fee2]
  } else {
    const [amountOut, newCurrentSqrtPrice] = swapOut(currentSqrtPrice, liquidity, amountIn2, false)
    if (+(new Decimal(newCurrentSqrtPrice)).cmp(highSqrtPrice) === 1) {
      throw new Error(`out of range: ${newCurrentSqrtPrice.toString()} > ${highSqrtPrice}`)
    }
    return [newCurrentSqrtPrice, amountOut, fee2]
  }
}

const swapX = (amountIn: string, lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, liquidity: string, feeRatio: string): [string, string, string] => {
  return swap(true, amountIn, lowSqrtPrice, currentSqrtPrice, highSqrtPrice, liquidity, feeRatio)
}
const swapY = (amountIn: string, lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, liquidity: string, feeRatio: string): [string, string, string] => {
  return swap(false, amountIn, lowSqrtPrice, currentSqrtPrice, highSqrtPrice, liquidity, feeRatio)
}

const swapAmountUp = (startSqrtPrice: string, endSqrtPrice: string, liquidity: string): [any, any] => {
  // end_price >= start_price
// token_in is y; y = l * (e - s); round_up;
// token_out is x; x = l * (1/s - 1/e); round_down.
  if (+(new Decimal(startSqrtPrice)).cmp(endSqrtPrice) === 1) {
    throw new Error('invalid price: endSqrtPrice should be greater than startSqrtPrice')
  }

  // token y
  const amountIn = RoundUpDec.mul(liquidity, RoundUpDec.sub(endSqrtPrice, startSqrtPrice))
  // token x
  const reciprocal = RoundDownDec.div(1, startSqrtPrice)
  const reciprocal2 = RoundUpDec.div(1, endSqrtPrice)
  const amountOut = RoundDownDec.mul(liquidity, RoundDownDec.sub(reciprocal, reciprocal2))
  return [amountIn, amountOut]
}

const swapAmountDown = (startSqrtPrice: string, endSqrtPrice: string, liquidity: string): [any, any] => {
  // end_price <= start_price
// token_in is x; x = l * (1/e - 1/s); round_up;
// token_out is y; y = l * (s - e); round_down.
  if (+(new Decimal(startSqrtPrice)).cmp(endSqrtPrice) === -1) {
    throw new Error('invalid price: endSqrtPrice should be greater than startSqrtPrice')
  }
  // token x
  const reciprocal = RoundUpDec.div(1, endSqrtPrice)
  const reciprocal2 = RoundDownDec.div(1, startSqrtPrice)
  const amountIn = RoundUpDec.mul(liquidity, RoundUpDec.sub(reciprocal, reciprocal2))

  // token y
  const amountOut = RoundDownDec.mul(liquidity, RoundDownDec.sub(startSqrtPrice, endSqrtPrice))
  return [amountIn, amountOut]
}

const getAmountXY = (lowSqrtPrice: string, currentSqrtPrice: string, highSqrtPrice: string, liquidity: string): [string, string] => {
  let amountX = '0'
  let amountY = '0'
  if ((new Decimal(currentSqrtPrice)).cmp(new Decimal(lowSqrtPrice)) == 0) {
    const [amountX_] = swapAmountDown(highSqrtPrice, currentSqrtPrice, liquidity)
    amountX = amountX_.toFixed(0, Decimal.ROUND_UP)
  } else if ((new Decimal(currentSqrtPrice)).cmp(new Decimal(highSqrtPrice)) == 0) {
    const [amountY_] = swapAmountUp(lowSqrtPrice, currentSqrtPrice, liquidity)
    amountY = amountY_.toFixed(0, Decimal.ROUND_UP)
  } else {
    const [amountX_] = swapAmountDown(highSqrtPrice, currentSqrtPrice, liquidity)
    amountX = amountX_.toFixed(0, Decimal.ROUND_UP)
    const [amountY_] = swapAmountUp(lowSqrtPrice, currentSqrtPrice, liquidity)
    amountY = amountY_.toFixed(0, Decimal.ROUND_UP)
  }
  return [amountX, amountY]
}

export { sqrtPrice, getNewSqrtPriceFromAmountXRoundUp, getNewSqrtPriceFromAmountYRoundingDown, swapOut, swap, swapX, swapY, swapAmountDown, getAmountXY }
