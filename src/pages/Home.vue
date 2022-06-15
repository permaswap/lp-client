<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

import { initSocket, sendRegister, getSwapInfo, sendAdd, sendSign } from '@/lib/swap'
import { ethers } from 'ethers'
import { onMounted } from 'vue'
import Everpay from 'everpay'
import ethereumLib from 'everpay/esm/lib/ethereum'
import hashPersonalMessage from 'everpay/esm/lib/hashPersonalMessage'
import { toBN } from '@/lib/util'
import { getAmountYAndLiquidity, getHighSqrtPrice, getLowSqrtPrice } from '@/lib/lp'
import { swapX, swapY } from '@/lib/math'

const ethWalletHasUSDT = {
  address: '0x26361130d5d6E798E9319114643AF8c868412859',
  privateKey: '94c97d4cc865d77afaf2d64147f7c067890e1485eb5d8e2c15cc0b7528a08b47'
}

const provider = new ethers.providers.InfuraProvider('kovan')
const signer = new ethers.Wallet(ethWalletHasUSDT.privateKey, provider)

const everpay = new Everpay({
  account: ethWalletHasUSDT.address,
  ethConnectedSigner: signer,
  chainType: 'ethereum' as any,
  debug: true
})

const lowPrice = 500
const highPrice = 5000
const currentPrice = 2000
const tokenXAmount = 1
const feeRatio = '0.003'

onMounted(async () => {
  const info = await everpay.info()
  const swapInfo = await getSwapInfo()
  console.log(swapInfo, info)

  const poolId = '0x7bd8bbec75143287a3ac339d7f3235f130dd8e779663cde432558852d6d33d80'
  const tokenX = info.tokenList.find(t => t.symbol === 'ETH')
  const tokenY = info.tokenList.find(t => t.symbol === 'USDT')

  const uint8ArrayToHex = (uint8Array: Uint8Array) => {
    return '0x' + [...uint8Array].map((b) => {
      return b.toString(16).padStart(2, '0')
    }).join('')
  }

  const lowSqrtPrice = getLowSqrtPrice(toBN(lowPrice).times(toBN(10).pow(tokenY?.decimals)).dividedBy(toBN(10).pow(tokenX?.decimals)))
  const highSqrtPrice = getHighSqrtPrice(toBN(highPrice).times(toBN(10).pow(tokenY?.decimals)).dividedBy(toBN(10).pow(tokenX?.decimals)))
  const currentSqrtPrice = getHighSqrtPrice(toBN(currentPrice).times(toBN(10).pow(tokenY?.decimals)).dividedBy(toBN(10).pow(tokenX?.decimals)))
  const tokenXAmountDecimal = toBN(tokenXAmount).times(toBN(10).pow(tokenX?.decimals))
  const { amountY, liquidity } = getAmountYAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenXAmountDecimal as any)
  console.log('amountY', amountY)
  const jsonConfig = {
    tokenX: tokenX?.tag,
    tokenY: tokenY?.tag,
    feeRatio: feeRatio,
    currentSqrtPrice: currentSqrtPrice.toString(),
    lowSqrtPrice: lowSqrtPrice.toString(),
    highSqrtPrice: highSqrtPrice.toString(),
    liquidity: liquidity,
    priceDirection: 'both'
  }

  const validate = (lpId: string, paths: any[]) => {
    const amountInPath = paths.find((pa: any) => {
      return pa.lpId === lpId && pa.to.toLowerCase() === ethWalletHasUSDT.address.toLowerCase()
    })
    const amountOutPath = paths.find((pa: any) => {
      return pa.lpId === lpId && pa.from.toLowerCase() === ethWalletHasUSDT.address.toLowerCase()
    })
    if (amountInPath.tokenTag === jsonConfig.tokenX) {
      try {
        const [newCurrentSqrtPrice, amountOutY] = swapX(amountInPath.amount, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, feeRatio)
        if (toBN(amountOutY).gte(amountOutPath.amount)) {
          jsonConfig.currentSqrtPrice = newCurrentSqrtPrice
          return true
        }
      } catch (e) {}
    } else if (amountInPath.tokenTag === jsonConfig.tokenY) {
      try {
        const [newCurrentSqrtPrice, amountOutX] = swapY(amountInPath.amount, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, feeRatio)
        console.log('amountOutPath', amountOutX)
        if (toBN(amountOutX).gte(amountOutPath.amount)) {
          jsonConfig.currentSqrtPrice = newCurrentSqrtPrice
          return true
        }
      } catch (e) {
        console.log('errr', e)
      }
    }
    return false
  }

  const msg = 'PoolID:' + poolId + '\n' +
    'Address:' + ethWalletHasUSDT.address + '\n' +
    'LowSqrtPrice:' + lowSqrtPrice.toString() + '\n' +
    'HighSqrtPrice:' + highSqrtPrice.toString() + '\n' +
    'PriceDirection:' + jsonConfig.priceDirection

  console.log('msg', msg)

  const lpId = uint8ArrayToHex(hashPersonalMessage(Buffer.from(msg)))
  console.log('lpId', lpId)

  initSocket({
    handleError (error: any) {
      console.log('error', error)
    },
    handleOpen (data: any) {
      console.log('open', data)
    },
    async handleSalt (data: any) {
      console.log('salt', data.salt)
      const sig = await ethereumLib.signMessageAsync(signer, ethWalletHasUSDT.address, data.salt)
      sendRegister({
        address: ethWalletHasUSDT.address,
        sig
      })

      // add
      setTimeout(() => {
        sendAdd(jsonConfig as any)
      }, 1000)
    },
    async handleOrder (data: any) {
      console.log('order', data)
      console.log('validate', validate(lpId, data.paths))

      const bundleDataWithSigs = await everpay.signBundleData(data.bundle)
      sendSign({
        address: ethWalletHasUSDT.address,
        bundle: bundleDataWithSigs
      })
    }
  })
})
</script>

<template>
  <div class="bg-black text-white">
    1234
  </div>
</template>
