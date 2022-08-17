<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, Ref } from 'vue'
import Everpay from 'everpay'
import { getLpId, getPoolPrice, getSwapInfo, sendAdd } from '@/lib/swap'
import { useStore } from '@/store'
import { toBN } from '@/lib/util'
import { getAmountXAndLiquidity, getAmountYAndLiquidity, getHighSqrtPrice, getLowSqrtPrice } from '@/lib/lp'
import PairModal from './PairModal.vue'
import PreviewModal from './PreviewModal.vue'
import TokenLogo from './TokenLogo.vue'

export default defineComponent({
  components: { PairModal, PreviewModal, TokenLogo },
  setup () {
    const store = useStore()
    const lowPrice = ref('0')
    const highPrice = ref('∞')
    const currentPrice = ref('1450')
    const pairModalVisible = ref(false)
    const hideAddPoolModal = () => {
      store.commit('updateAddPoolModalVisible', false)
    }
    const setFullRange = () => {
      lowPrice.value = '0'
      highPrice.value = '∞'
      tokenXAmount.value = ''
      tokenYAmount.value = ''
    }
    let jsonConfig = null as any
    const tokenX = ref(null) as Ref<any>
    const tokenY = ref(null) as Ref<any>
    const tokenXs = ref([])
    const tokenYs = ref([])
    const pairs = ref([])
    const tokenXBalance = ref('0')
    const tokenYBalance = ref('0')
    const tokenXAmount = ref('')
    const tokenYAmount = ref('')
    const account = computed(() => store.state.account)
    const previewModalVisible = ref(false)
    const btnMessage = computed(() => {
      if (!+tokenXAmount.value || !+tokenYAmount.value || +tokenXAmount.value <= 0 || +tokenYAmount.value <= 0) {
        return 'Enter an Amount'
      }
      if (+tokenXAmount.value > +tokenXBalance.value) {
        return 'Insufficient Tokenin Balance'
      }
      if (+tokenYAmount.value > +tokenYBalance.value) {
        return 'Insufficient Tokenout Balance'
      }
      return 'Preview'
    })
    const everpay = new Everpay({
      chainType: 'ethereum' as any,
      debug: true
    })
    let info = null as any
    let swapInfo = null as any
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
    const getPairs = (tokenList: any, poolList: any) => {
      const poolListValues = Object.values(poolList)
      return poolListValues.map((poolListValue: any) => {
        return {
          tokenX: tokenList.find((t: any) => t.tag === poolListValue.tokenXTag),
          tokenY: tokenList.find((t: any) => t.tag === poolListValue.tokenYTag)
        }
      })
    }
    const updateBalances = async () => {
      tokenXBalance.value = await everpay.balance({ account: account.value, symbol: (tokenX.value as any).symbol })
      tokenYBalance.value = await everpay.balance({ account: account.value, symbol: (tokenY.value as any).symbol })
    }
    onMounted(async () => {
      info = await everpay.info()
      swapInfo = await getSwapInfo()
      pairs.value = getPairs(info.tokenList, swapInfo.poolList) as any
      tokenXs.value = getTokenXs(info.tokenList, swapInfo.poolList)
      tokenX.value = tokenXs.value[0]
      tokenYs.value = getTokenYs(info.tokenList, swapInfo.poolList, tokenX.value)
      tokenY.value = tokenYs.value[0]
      updateBalances()
      const { poolId } = getPoolData(swapInfo.poolList)
      currentPrice.value = await getPoolPrice(poolId, tokenX.value.decimals, tokenY.value.decimals)
    })
    const getPoolData = (poolList: any) => {
      const poolListEntires = Object.entries(poolList)
      let poolId = ''
      let feeRatio = ''
      poolListEntires.forEach(entry => {
        const [pid, poolListValue] = entry as any
        if (poolListValue.tokenXTag === (tokenX as any).value.tag && poolListValue.tokenYTag === (tokenY as any).value.tag) {
          feeRatio = poolListValue.feeRatio
          poolId = pid
        }
      })
      return { poolId, feeRatio }
    }
    const getSqrtPrice = () => {
      const lowSqrtPrice = +lowPrice.value === 0
        ? toBN(2).pow(-64).toString()
        : getLowSqrtPrice(toBN(lowPrice.value).times(toBN(10).pow((tokenY as any).value?.decimals)).dividedBy(toBN(10).pow((tokenX as any).value?.decimals)))
      const highSqrtPrice = highPrice.value === '∞'
        ? toBN(2).pow(64).toString()
        : getHighSqrtPrice(toBN(highPrice.value).times(toBN(10).pow((tokenY as any).value?.decimals)).dividedBy(toBN(10).pow((tokenX as any).value?.decimals)))
      const currentSqrtPrice = getHighSqrtPrice(toBN(currentPrice.value).times(toBN(10).pow((tokenY as any).value?.decimals)).dividedBy(toBN(10).pow((tokenX as any).value?.decimals)))
      return {
        lowSqrtPrice,
        highSqrtPrice,
        currentSqrtPrice
      }
    }
    const handleAmountXInput = () => {
      const { lowSqrtPrice, highSqrtPrice, currentSqrtPrice } = getSqrtPrice()
      const tokenXAmountDecimal = toBN(tokenXAmount.value).times(toBN(10).pow((tokenX as any).value?.decimals))
      const { amountY, liquidity } = getAmountYAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenXAmountDecimal as any)
      tokenYAmount.value = toBN(amountY).dividedBy(toBN(10).pow((tokenY as any).value?.decimals)).toString()
      const { feeRatio } = getPoolData(swapInfo.poolList)
      jsonConfig = {
        tokenX: (tokenX as any).value?.tag,
        tokenY: (tokenY as any).value?.tag,
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
      const tokenYAmountDecimal = toBN(tokenYAmount.value).times(toBN(10).pow((tokenY as any).value?.decimals))
      const { amountX, liquidity } = getAmountXAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenYAmountDecimal as any)
      tokenXAmount.value = toBN(amountX).dividedBy(toBN(10).pow((tokenX as any).value?.decimals)).toString()
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
    const setMaxTokenXAmount = () => {
      tokenXAmount.value = tokenXBalance.value
      handleAmountXInput()
    }
    const setMaxTokenYAmount = () => {
      tokenYAmount.value = tokenYBalance.value
      handleAmountYInput()
    }
    watch(account, () => {
      updateBalances()
    })
    watch([lowPrice, highPrice], () => {
      tokenXAmount.value = ''
      tokenYAmount.value = ''
    })

    const selectPair = async (pair: any) => {
      tokenX.value = pair.tokenX
      tokenY.value = pair.tokenY
      pairModalVisible.value = false
      setFullRange()
      updateBalances()
      const { poolId } = getPoolData(swapInfo.poolList)
      currentPrice.value = await getPoolPrice(poolId, tokenX.value.decimals, tokenY.value.decimals)
    }
    const showPreviewModal = () => {
      if (btnMessage.value === 'Preview') {
        previewModalVisible.value = true
      }
    }
    const handleAdd = async () => {
      sendAdd(jsonConfig as any)
      previewModalVisible.value = false
      const { poolId } = getPoolData(swapInfo.poolList)
      const lpId = getLpId(poolId, account.value, jsonConfig)
      store.commit('addLp', {
        ...jsonConfig,
        lpId,
        poolId,
        tokenXSymbol: tokenX.value.symbol,
        tokenYSymbol: tokenY.value.symbol,
        tokenXDecimal: tokenX.value.decimals,
        tokenYDecimal: tokenY.value.decimals,
        lowPrice: lowPrice.value,
        highPrice: highPrice.value
      })
    }
    return {
      tokenX,
      tokenY,
      tokenXBalance,
      tokenYBalance,
      tokenXAmount,
      tokenYAmount,
      pairs,
      selectPair,
      pairModalVisible,
      lowPrice,
      highPrice,
      btnMessage,
      currentPrice,
      setFullRange,
      handleAmountXInput,
      handleAmountYInput,
      handleAdd,
      previewModalVisible,
      setMaxTokenXAmount,
      setMaxTokenYAmount,
      showPreviewModal,
      hideAddPoolModal
    }
  }
})
</script>

<template>
  <div style="width:864px;background: #161E1B;border-radius: 24px;" class="mx-auto p-8">
    <div
      class="flex flex-row items-center justify-between pb-4 mb-6"
      style="border-bottom:1px solid rgba(255, 255, 255, 0.08);">
      <img
        src="@/images/back.png"
        style="width:14px;"
        class="cursor-pointer"
        @click="hideAddPoolModal">
      <span style="font-size: 20px;">Add Liquidity</span>
      <span style="color: #79D483;" class="text-sm cursor-pointer" @click="setFullRange">Clear All</span>
    </div>
    <div class="flex flex-row">
      <div style="width:384px;" class="mr-8">
        <div class="mb-4">
          Select Pair
        </div>
        <div class="flex flex-row items-center justify-between mb-4">
          <div
            class="p-2 border-box cursor-pointer flex flex-row items-center"
            style="background: #000A06;border-radius: 8px;font-size: 20px;width:184px;"
            @click="pairModalVisible = true"
          >
            <TokenLogo class="w-5 h-5 mr-1" :symbol="tokenX ? tokenX.symbol : ''" />
            {{ tokenX && tokenX.symbol }}
          </div>
          <div
            class="p-2 border-box cursor-pointer flex flex-row items-center"
            style="background: #000A06;border-radius: 8px;font-size: 20px;width:184px;"
            @click="pairModalVisible = true"
          >
            <TokenLogo class="w-5 h-5 mr-1" :symbol="tokenY ? tokenY.symbol : ''" />
            {{ tokenY && tokenY.symbol }}
          </div>
        </div>
        <div
          class="p-2 text-sm mb-6"
          style="border: 1px solid rgba(255, 255, 255, 0.08);border-radius: 8px;color: rgba(255, 255, 255, 0.65);">
          No fees, become a node, win PSN！
        </div>
        <div class="mb-4">
          Deposit Amounts
        </div>
        <div>
          <div
            class="px-4 pt-4 pb-3 flex flex-row items-center justify-between mb-2"
            style="background: #000A06;border-radius: 12px;">
            <div>
              <div class="px-2 py-1 mb-2 flex flex-row items-center" style="background: rgba(24, 59, 33, 0.65);border-radius: 8px;">
                <TokenLogo class="w-4 h-4 mr-1" :symbol="tokenX ? tokenX.symbol : ''" />
                {{ tokenX && tokenX.symbol }}
              </div>
              <div class="text-xs cursor-pointer" @click="setMaxTokenXAmount">
                <span style="color: #5AAD67;">Max</span> {{ tokenXBalance }}
              </div>
            </div>
            <input
              v-model="tokenXAmount"
              style="width:200px;background:transparent;outline:none;text-align:right;font-size: 30px;"
              placeholder="0.0"
              @input="handleAmountXInput">
          </div>

          <div
            class="px-4 pt-4 pb-3 flex flex-row items-center justify-between"
            style="background: #000A06;border-radius: 12px;">
            <div>
              <div class="px-2 py-1 mb-2 flex flex-row items-center" style="background: rgba(24, 59, 33, 0.65);border-radius: 8px;">
                <TokenLogo class="w-4 h-4 mr-1" :symbol="tokenY ? tokenY.symbol : ''" />
                {{ tokenY && tokenY.symbol }}
              </div>
              <div class="text-xs cursor-pointer" @click="setMaxTokenYAmount">
                <span style="color: #5AAD67;">Max</span> {{ tokenYBalance }}
              </div>
            </div>
            <input
              v-model="tokenYAmount"
              style="width:200px;background:transparent;outline:none;text-align:right;font-size: 30px;"
              placeholder="0.0"
              @input="handleAmountYInput">
          </div>
        </div>
      </div>
      <div style="width:384px;">
        <div class="mb-4">
          Set Price Range
        </div>
        <div style="background: #000A06;border-radius: 12px;" class="text-center text-xs py-2 mb-4">
          <div style="color: rgba(255, 255, 255, 0.65);">
            Current Price
          </div>
          <div class="my-2" style="font-size:20px;">
            {{ currentPrice }} {{ tokenY && tokenY.symbol }} per {{ tokenX && tokenX.symbol }}
          </div>
          <div style="color: rgba(255, 255, 255, 0.65);">
            {{ 1 / currentPrice }} {{ tokenX && tokenX.symbol }} per {{ tokenY && tokenY.symbol }}
          </div>
        </div>
        <div class="flex flex-row items-center justify-between mb-4">
          <div class="p-2" style="background: #000A06;border-radius: 12px;width:182px;height:92px;box-sizing: border-box;">
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              Min Price
            </div>
            <div class="flex flex-row items-center justify-between">
              <div class="w-6 h-6 flex flex-row items-center justify-center" style="background: #161E1B;border-radius: 6px;">
                -
              </div>
              <input
                v-model="lowPrice"
                style="font-size: 20px;outline: none;width: 100px;text-align: center; background-color: transparent;"
                class="my-2"
              >
              <div class="w-6 h-6 flex flex-row items-center justify-center" style="background: #161E1B;border-radius: 6px;">
                +
              </div>
            </div>
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              {{ tokenY && tokenY.symbol }} per {{ tokenX && tokenX.symbol }}
            </div>
          </div>
          <div class="p-2" style="background: #000A06;border-radius: 12px;width:182px;height:92px;box-sizing: border-box;">
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              Max Price
            </div>
            <div class="flex flex-row items-center justify-between">
              <div class="w-6 h-6 flex flex-row items-center justify-center" style="background: #161E1B;border-radius: 6px;">
                -
              </div>
              <input
                v-model="highPrice"
                style="font-size: 20px;outline: none;width: 100px;text-align: center; background-color: transparent;"
                class="my-2"
              >
              <div class="w-6 h-6 flex flex-row items-center justify-center" style="background: #161E1B;border-radius: 6px;">
                +
              </div>
            </div>
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              {{ tokenY && tokenY.symbol }} per {{ tokenX && tokenX.symbol }}
            </div>
          </div>
        </div>
        <div
          class="text-sm cursor-pointer"
          style="margin-bottom: 52px;padding: 6px 8px;background: rgba(24, 59, 33, 0.2);border: 1px solid #183B21;border-radius: 8px;text-align:center;"
          @click="setFullRange"
        >
          Full Range
        </div>
        <div
          class="py-3 text-center"
          style="border-radius: 8px;"
          :style="btnMessage === 'Preview' ?
            'background: #79D483;color:#000;cursor:pointer' :
            'background: rgba(255, 255, 255, 0.12);color: rgba(255, 255, 255, 0.3);cursor:not-allowed'"
          @click="showPreviewModal"
        >
          {{ btnMessage }}
        </div>
      </div>
    </div>
    <PairModal
      :class="pairModalVisible ? 'block' : 'hidden'"
      :pairs="pairs"
      @selectPair="selectPair"
      @closePairModal="pairModalVisible = false" />
    <PreviewModal
      :class="previewModalVisible ? 'block' : 'hidden'"
      :low-price="lowPrice"
      :high-price="highPrice"
      :token-x="tokenX"
      :token-y="tokenY"
      :token-x-amount="tokenXAmount"
      :token-y-amount="tokenYAmount"
      :current-price="currentPrice"
      @confirm="handleAdd"
      @closeModal="previewModalVisible = false"
    />
  </div>
</template>
