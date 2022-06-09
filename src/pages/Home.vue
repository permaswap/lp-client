<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

import { initSocket, sendRegister, getSwapInfo, sendAdd } from '@/lib/swap'
import { ethers } from 'ethers'
import { onMounted } from 'vue'
import Everpay from 'everpay'
import ethereumLib from 'everpay/esm/lib/ethereum'
import { toBN } from '@/lib/util'
import { getAmountYAndLiquidity, getHighSqrtPrice, getLowSqrtPrice } from '@/lib/lp'

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

  const tokenX = info.tokenList.find(t => t.symbol === 'ETH')
  const tokenY = info.tokenList.find(t => t.symbol === 'USDT')

  const lowSqrtPrice = getLowSqrtPrice(toBN(lowPrice).times(toBN(10).pow(tokenY?.decimals)).dividedBy(toBN(10).pow(tokenX?.decimals)))
  const highSqrtPrice = getHighSqrtPrice(toBN(highPrice).times(toBN(10).pow(tokenY?.decimals)).dividedBy(toBN(10).pow(tokenX?.decimals)))
  const currentSqrtPrice = getHighSqrtPrice(toBN(currentPrice).times(toBN(10).pow(tokenY?.decimals)).dividedBy(toBN(10).pow(tokenX?.decimals)))
  const tokenXAmountDecimal = toBN(tokenXAmount).times(toBN(10).pow(tokenX?.decimals))
  const { amountY, liquidity } = getAmountYAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenXAmountDecimal as any)

  console.log('amountY', amountY)

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
        sendAdd({
          tokenX: tokenX?.tag,
          tokenY: tokenY?.tag,
          feeRatio: feeRatio,
          currentSqrtPrice: currentSqrtPrice,
          lowSqrtPrice: lowSqrtPrice,
          highSqrtPrice: highSqrtPrice,
          liquidity: liquidity,
          priceDirection: 'both'
        })
      }, 1000)
    },
    handleOrder (data: any) {
      console.log('order', data)
    }
  })
})
</script>

<template>
  <div class="bg-black text-white">
    1234
  </div>
</template>
