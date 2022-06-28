<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

import { initSocket, sendRegister, getSwapInfo, sendAdd, sendSign } from '@/lib/swap'
import { ethers, Wallet } from 'ethers'
import { onMounted, ref } from 'vue'
import Everpay from 'everpay'
import ethereumLib from 'everpay/esm/lib/ethereum'
import hashPersonalMessage from 'everpay/esm/lib/hashPersonalMessage'
import { toBN } from '@/lib/util'
import { getAmountXAndLiquidity, getAmountYAndLiquidity, getHighSqrtPrice, getLowSqrtPrice } from '@/lib/lp'
import { swapX, swapY } from '@/lib/math'

const privateKey = ref('')
const lowPrice = ref('500')
const highPrice = ref('5000')
const currentPrice = ref('2000')
let wallet = null as any

const everpay = new Everpay({
  chainType: 'ethereum' as any,
  debug: true
})

let info = null as any
let swapInfo = null as any

const tokenX = ref(null)
const tokenY = ref(null)
const tokenXs = ref([])
const tokenYs = ref([])
const tokenXSelectMask = ref(false)
const tokenYSelectMask = ref(false)
const tokenXAmount = ref('')
const tokenYAmount = ref('')
let jsonConfig = null as any
const jsonConfigArr: any[] = []

const getTokenXs = (tokenList: any, poolList: any) => {
  const poolListValues = Object.values(poolList)
  return tokenList.filter((t: any) => {
    return poolListValues.some((poolListValue: any) => {
      return poolListValue.tokenXTag === t.tag
    })
  })
}

const getTokenYs = (tokenList: any, poolList: any, tokenX: any) => {
  const poolListValues = Object.values(poolList)
  const filterPoolListValues = poolListValues.filter((poolListValue: any) => {
    return poolListValue.tokenXTag === tokenX.tag
  })
  return tokenList.filter((t: any) => {
    return filterPoolListValues.some((poolListValue: any) => {
      return poolListValue.tokenYTag === t.tag
    })
  })
}

const getLpId = (poolId: string, jsonConfig: any) => {
  const msg = 'PoolID:' + poolId + '\n' +
  // 需要 checksum 地址
    'Address:' + wallet.address + '\n' +
    'LowSqrtPrice:' + jsonConfig.lowSqrtPrice.toString() + '\n' +
    'HighSqrtPrice:' + jsonConfig.highSqrtPrice.toString() + '\n' +
    'PriceDirection:' + jsonConfig.priceDirection
  console.log('msg', msg)
  const lpId = uint8ArrayToHex(hashPersonalMessage(Buffer.from(msg)))
  console.log('lpId', lpId)
  return lpId
}

const getPoolData = (poolList: any) => {
  const poolListEntires = Object.entries(poolList)
  let poolId = ''
  let feeRatio = ''
  poolListEntires.forEach(entry => {
    const [pid, poolListValue] = entry as any
    if (poolListValue.tokenXTag === tokenX.value.tag && poolListValue.tokenYTag === tokenY.value.tag) {
      feeRatio = poolListValue.feeRatio
      poolId = pid
    }
  })
  return { poolId, feeRatio }
}

onMounted(async () => {
  info = await everpay.info()
  swapInfo = await getSwapInfo()
  tokenXs.value = getTokenXs(info.tokenList, swapInfo.poolList)
  tokenX.value = tokenXs.value[0]
  tokenYs.value = getTokenYs(info.tokenList, swapInfo.poolList, tokenX.value)
  tokenY.value = tokenYs.value[0]
})

const uint8ArrayToHex = (uint8Array: Uint8Array) => {
  return '0x' + [...uint8Array].map((b) => {
    return b.toString(16).padStart(2, '0')
  }).join('')
}

const handleTokenXSelect = (tX: any) => {
  tokenXSelectMask.value = false
  if (tX.symbol === (tokenX as any).value.symbol) {
    return
  }
  tokenX.value = tX
  tokenYs.value = getTokenYs(info.tokenList, swapInfo.poolList, tokenX.value)
  if (tokenYs.value.every((tY: any) => {
    return tY.symbol !== (tokenY as any).value.symbol
  })) {
    tokenY.value = tokenYs.value[0]
  }
  lowPrice.value = ''
  currentPrice.value = ''
  highPrice.value = ''
  tokenXAmount.value = ''
  tokenYAmount.value = ''
}

const handleTokenYSelect = (tY: any) => {
  tokenYSelectMask.value = false
  if (tY.symbol === (tokenY as any).value.symbol) {
    return
  }
  tokenY.value = tY
  lowPrice.value = ''
  currentPrice.value = ''
  highPrice.value = ''
  tokenXAmount.value = ''
  tokenYAmount.value = ''
}

const getSqrtPrice = () => {
  const lowSqrtPrice = getLowSqrtPrice(toBN(lowPrice.value).times(toBN(10).pow(tokenY.value?.decimals)).dividedBy(toBN(10).pow(tokenX.value?.decimals)))
  const highSqrtPrice = getHighSqrtPrice(toBN(highPrice.value).times(toBN(10).pow(tokenY.value?.decimals)).dividedBy(toBN(10).pow(tokenX.value?.decimals)))
  const currentSqrtPrice = getHighSqrtPrice(toBN(currentPrice.value).times(toBN(10).pow(tokenY.value?.decimals)).dividedBy(toBN(10).pow(tokenX.value?.decimals)))
  return {
    lowSqrtPrice,
    highSqrtPrice,
    currentSqrtPrice
  }
}

const handleAmountXInput = () => {
  const { lowSqrtPrice, highSqrtPrice, currentSqrtPrice } = getSqrtPrice()
  const tokenXAmountDecimal = toBN(tokenXAmount.value).times(toBN(10).pow(tokenX.value?.decimals))
  const { amountY, liquidity } = getAmountYAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenXAmountDecimal as any)
  tokenYAmount.value = toBN(amountY).dividedBy(toBN(10).pow(tokenY.value?.decimals)).toString()
  const { feeRatio } = getPoolData(swapInfo.poolList)
  jsonConfig = {
    tokenX: tokenX.value?.tag,
    tokenY: tokenY.value?.tag,
    feeRatio: feeRatio,
    currentSqrtPrice: currentSqrtPrice.toString(),
    lowSqrtPrice: lowSqrtPrice.toString(),
    highSqrtPrice: highSqrtPrice.toString(),
    liquidity: liquidity,
    priceDirection: 'both'
  }
}

const handleAmountYInput = () => {
  const { lowSqrtPrice, highSqrtPrice, currentSqrtPrice } = getSqrtPrice()
  const tokenYAmountDecimal = toBN(tokenYAmount.value).times(toBN(10).pow(tokenY.value?.decimals))
  const { amountX, liquidity } = getAmountXAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenYAmountDecimal as any)
  tokenXAmount.value = toBN(amountX).dividedBy(toBN(10).pow(tokenX.value?.decimals)).toString()
  const { feeRatio } = getPoolData(swapInfo.poolList)
  jsonConfig = {
    tokenX: tokenX.value?.tag,
    tokenY: tokenY.value?.tag,
    feeRatio: feeRatio,
    currentSqrtPrice: currentSqrtPrice.toString(),
    lowSqrtPrice: lowSqrtPrice.toString(),
    highSqrtPrice: highSqrtPrice.toString(),
    liquidity: liquidity,
    priceDirection: 'both'
  }
}

const handleAdd = async () => {
  sendAdd(jsonConfig as any)
  const { poolId } = getPoolData(swapInfo.poolList)
  jsonConfigArr.push({
    poolId,
    lpId: getLpId(poolId, jsonConfig),
    ...jsonConfig
  })
}

const handleRegister = () => {
  wallet = new Wallet(privateKey.value)
  initSocket({
    handleError (error: any) {
      console.log('error', error)
    },
    handleOpen (data: any) {
      console.log('open', data)
    },
    async handleSalt (data: any) {
      const provider = new ethers.providers.InfuraProvider('kovan')
      const signer = new ethers.Wallet(wallet.privateKey, provider)
      console.log('salt', data.salt)
      const sig = await ethereumLib.signMessageAsync(signer, wallet.address, data.salt)
      sendRegister({
        address: wallet.address,
        sig
      })
    },
    async handleOrder (data: any) {
      const validatePathsData = (paths: any): boolean => {
        const stack = {}
        let result: boolean = true
        paths.forEach((pathData) => {
          if (!stack[pathData.lpId]) {
            stack[pathData.lpId] = {}
          }
          if (pathData.to.toLowerCase() === wallet.address.toLowerCase()) {
            stack[pathData.lpId].amountIn = pathData.amount
            stack[pathData.lpId].tokenTagIn = pathData.tokenTag
          }
          if (pathData.from.toLowerCase() === wallet.address.toLowerCase()) {
            stack[pathData.lpId].amountOut = pathData.amount
            stack[pathData.lpId].tokenTagOut = pathData.tokenTag
          }
        })
        console.log('stack', stack)
        Object.entries(stack).forEach(([lpId, amountData]) => {
          const jsonConfig = jsonConfigArr.find(jsonConfig => {
            return jsonConfig.lpId === lpId
          })
          console.log('jsonConfig', jsonConfig)
          if (jsonConfig) {
            if ((amountData as any).tokenTagIn === jsonConfig.tokenX) {
              try {
                const [newCurrentSqrtPrice, amountOutY] = swapX(amountData.amountIn, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, jsonConfig.feeRatio)
                console.log('amountOutY', amountOutY)
                if (toBN(amountOutY).gte(amountData.amountOut)) {
                  jsonConfig.currentSqrtPrice = newCurrentSqrtPrice
                } else {
                  result = false
                }
              } catch (e) { console.log('errr', e) }
            } else if ((amountData as any).tokenTagOut === jsonConfig.tokenX) {
              try {
                const [newCurrentSqrtPrice, amountOutX] = swapY(amountData.amountIn, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, jsonConfig.feeRatio)
                console.log('amountOutY', amountOutX)
                console.log('amountOutPath', amountOutX)
                if (toBN(amountOutX).gte(amountData.amountOut)) {
                  jsonConfig.currentSqrtPrice = newCurrentSqrtPrice
                } else {
                  result = false
                }
              } catch (e) {
                console.log('errr', e)
              }
            }
          }
        })
        return result
      }
      // const validate = (lpId: string, paths: any[]) => {
      //   const amountInPath = paths.find((pa: any) => {
      //     return pa.lpId === lpId && pa.to.toLowerCase() === wallet.address.toLowerCase()
      //   })
      //   const amountOutPath = paths.find((pa: any) => {
      //     return pa.lpId === lpId && pa.from.toLowerCase() === wallet.address.toLowerCase()
      //   })
      //   if (amountInPath.tokenTag === jsonConfig.tokenX) {
      //     try {
      //       const [newCurrentSqrtPrice, amountOutY] = swapX(amountInPath.amount, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, feeRatio)
      //       if (toBN(amountOutY).gte(amountOutPath.amount)) {
      //         jsonConfig.currentSqrtPrice = newCurrentSqrtPrice
      //         return true
      //       }
      //     } catch (e) {}
      //   } else if (amountInPath.tokenTag === jsonConfig.tokenY) {
      //     try {
      //       const [newCurrentSqrtPrice, amountOutX] = swapY(amountInPath.amount, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, feeRatio)
      //       console.log('amountOutPath', amountOutX)
      //       if (toBN(amountOutX).gte(amountOutPath.amount)) {
      //         jsonConfig.currentSqrtPrice = newCurrentSqrtPrice
      //         return true
      //       }
      //     } catch (e) {
      //       console.log('errr', e)
      //     }
      //   }
      //   return false
      // }

      console.log('order', data)
      const validate = validatePathsData(data.paths)
      console.log('validate', validate)
      if (validate) {
        const provider = new ethers.providers.InfuraProvider('kovan')
        const signer = new ethers.Wallet(privateKey.value, provider)
        const everpayWithAccount = new Everpay({
          account: signer.address,
          ethConnectedSigner: signer,
          chainType: 'ethereum' as any,
          debug: true
        })

        const bundleDataWithSigs = await everpayWithAccount.signBundleData(data.bundle)
        sendSign({
          address: wallet.address,
          bundle: bundleDataWithSigs
        })
      }
    }
  })
}
</script>

<template>
  <div class="bg-white">
    <div>
      <input v-model="privateKey" type="text" placeholder="请输入私钥">
      <button @click="handleRegister">
        注册
      </button>
    </div>
    <div>
      <div>
        <span @click="tokenXSelectMask = true">{{ tokenX && tokenX.symbol }}</span>
        <input
          v-model="tokenXAmount"
          type="text"
          placeholder="请输入 tokenX 数量"
          @input="handleAmountXInput">
      </div>
      <div>
        <span @click="tokenYSelectMask = true">{{ tokenY && tokenY.symbol }}</span>
        <input
          v-model="tokenYAmount"
          type="text"
          placeholder="请输入 tokenY 数量"
          @input="handleAmountYInput">
      </div>
      <div>
        最低价格
        <input v-model="lowPrice" type="text" placeholder="最低价格">
      </div>
      <div>
        当前价格
        <input v-model="currentPrice" type="text" placeholder="当前价格">
      </div>
      <div>
        最高价格
        <input v-model="highPrice" type="text" placeholder="最高价格">
      </div>
      <button @click="handleAdd">
        添加
      </button>

      <div class="fixed top-0 left-0 w-full h-full" style="background:rgba(0, 0, 0, 0.7)" :class="tokenXSelectMask ? 'block' : 'hidden'">
        <ul>
          <li v-for="tX in tokenXs" :key="tX.symbol" @click="handleTokenXSelect(tX)">
            {{ tX.symbol }}
          </li>
        </ul>
      </div>
      <div class="fixed top-0 left-0 w-full h-full" style="background:rgba(0, 0, 0, 0.7)" :class="tokenYSelectMask ? 'block' : 'hidden'">
        <ul>
          <li v-for="tY in tokenYs" :key="tY.symbol" @click="handleTokenYSelect(tY)">
            {{ tY.symbol }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
