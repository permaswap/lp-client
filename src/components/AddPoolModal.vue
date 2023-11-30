<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch, Ref } from 'vue'
import Everpay from 'everpay'
import { ethers } from 'ethers'
import { getLpId, getPoolPrice, sendAdd, isProd, getPenalty } from '@/lib/swap'
import { useStore } from '@/store'
import { formatInputPrecision, toBN, getAmountFromLps, isValidVersion } from '@/lib/util'
import { getHighSqrtPrice, getLowSqrtPrice } from '@/lib/lp'
import { getAmountXAndLiquidity, getAmountYAndLiquidity } from '@/lib/math'
import PairModal from './PairModal.vue'
import PreviewModal from './PreviewModal.vue'
import TokenLogo from './TokenLogo.vue'
import InputArea from './InputArea.vue'
import { permaMessage } from './Message'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { PairModal, PreviewModal, TokenLogo, InputArea },
  setup () {
    const store = useStore()
    const lowPrice = ref('0')
    const highPrice = ref('∞')
    const currentPrice = ref('')
    const pairModalVisible = ref(false)
    const dataLoading = ref(true)
    const { t, locale } = useI18n()
    const hideAddPoolModal = () => {
      store.commit('updateAddPoolModalVisible', false)
    }
    const setFullRange = () => {
      lowPrice.value = '0'
      highPrice.value = '∞'
      tokenXAmount.value = ''
      tokenYAmount.value = ''
      fullRangeNoticeVisible.value = false
    }
    const clearAll = () => {
      tokenXAmount.value = ''
      tokenYAmount.value = ''
      setLowHighPrice()
    }
    const setLowHighPrice = () => {
      lowPrice.value = formatInputPrecision(toBN(currentPrice.value).times(0.45).toString(), 8)
      highPrice.value = formatInputPrecision(toBN(currentPrice.value).times(2).toString(), 8)
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
    const fullRangeNoticeVisible = ref(false)
    const account = computed(() => store.state.account)
    const previewModalVisible = ref(false)
    const duplicateLpId = ref(false)
    const tokenXBalanceFormat = computed(() => formatInputPrecision(tokenXBalance.value, 6))
    const tokenYBalanceFormat = computed(() => formatInputPrecision(tokenYBalance.value, 6))
    const tokenXNotEnough = computed(() => {
      if (!account.value) {
        return false
      }
      if (!+tokenXAmount.value || !+tokenYAmount.value || +tokenXAmount.value <= 0 || +tokenYAmount.value <= 0) {
        return false
      }
      return +tokenXAmount.value > +tokenXBalance.value
    })
    const tokenYNotEnough = computed(() => {
      if (!account.value) {
        return false
      }
      if (!+tokenXAmount.value || !+tokenYAmount.value || +tokenXAmount.value <= 0 || +tokenYAmount.value <= 0) {
        return false
      }
      return +tokenYAmount.value > +tokenYBalance.value
    })
    const btnMessage = computed(() => {
      if (!account.value) {
        return 'sign_up'
      }
      if (!+tokenXAmount.value || !+tokenYAmount.value || +tokenXAmount.value <= 0 || +tokenYAmount.value <= 0) {
        return 'enter_amount'
      }
      if (+tokenXAmount.value > +tokenXBalance.value) {
        return t('insufficient_$symbol', { symbol: tokenX.value.symbol })
      }
      if (+tokenYAmount.value > +tokenYBalance.value) {
        return t('insufficient_$symbol', { symbol: tokenY.value.symbol })
      }
      return 'preview'
    })
    const invalidRange = computed(() => {
      if (+lowPrice.value > +highPrice.value) {
        return 'invalid_range_selected'
      } else if (+lowPrice.value > +currentPrice.value || (highPrice.value.trim() !== '' && +highPrice.value < +currentPrice.value)) {
        return 'invalid_out_range'
      } else {
        return ''
      }
    })
    const everpay = new Everpay({
      chainType: 'ethereum' as any,
      debug: !isProd
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
      console.log('poolListValues', poolListValues, tokenList)
      return poolListValues.map((poolListValue: any) => {
        return {
          tokenX: tokenList.find((t: any) => t.tag === poolListValue.tokenXTag),
          tokenY: tokenList.find((t: any) => t.tag === poolListValue.tokenYTag)
        }
      })
    }
    const updateBalances = async () => {
      const totalBalanceX = await everpay.balance({ account: account.value, tag: (tokenX.value as any).tag })
      const totalBalanceY = await everpay.balance({ account: account.value, tag: (tokenY.value as any).tag })
      tokenXBalance.value = toBN(totalBalanceX).minus(getAmountFromLps(store.state.lps, tokenX.value)).toString()
      tokenYBalance.value = toBN(totalBalanceY).minus(getAmountFromLps(store.state.lps, tokenY.value)).toString()
    }
    onMounted(async () => {
      dataLoading.value = true
      info = await everpay.info()
      await store.dispatch('updateInfoAsync')
      swapInfo = store.state.info
      pairs.value = getPairs(info.tokenList, swapInfo.poolList) as any
      console.log('pairs.value', pairs.value)
      tokenXs.value = getTokenXs(info.tokenList, swapInfo.poolList)
      tokenX.value = tokenXs.value[0]
      tokenYs.value = getTokenYs(info.tokenList, swapInfo.poolList, tokenX.value)
      tokenY.value = tokenYs.value[0]
      updateBalances()
      const { poolId } = getPoolData(swapInfo.poolList)
      currentPrice.value = await getPoolPrice(poolId)
      setLowHighPrice()
      dataLoading.value = false
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
      // toBN(2).pow(-64).toString() bignumber 只能截取到 0.00000000000000000005，通不过后端校验
        ? '0.00000000000000000006'
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
    const handleAmountXInput = (amount?: string) => {
      if (amount != null) {
        tokenXAmount.value = amount
      }
      if (amount === '') {
        tokenYAmount.value = ''
        return
      }
      if (+(amount as any) === 0 || +tokenXAmount.value === 0) {
        tokenYAmount.value = '0'
        return
      }
      const { lowSqrtPrice, highSqrtPrice, currentSqrtPrice } = getSqrtPrice()
      const tokenXAmountDecimal = toBN(tokenXAmount.value).times(toBN(10).pow((tokenX as any).value?.decimals))
      const { amountY, liquidity } = getAmountYAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenXAmountDecimal.toString() as any)
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
    const handleAmountYInput = (amount?: string) => {
      if (amount != null) {
        tokenYAmount.value = amount
      }
      if (amount === '') {
        tokenXAmount.value = ''
        return
      }
      if (+(amount as any) === 0 || +tokenYAmount.value === 0) {
        tokenXAmount.value = '0'
        return
      }
      const { lowSqrtPrice, highSqrtPrice, currentSqrtPrice } = getSqrtPrice()
      const tokenYAmountDecimal = toBN(tokenYAmount.value).times(toBN(10).pow((tokenY as any).value?.decimals))
      const { amountX, liquidity } = getAmountXAndLiquidity(lowSqrtPrice, currentSqrtPrice, highSqrtPrice, tokenYAmountDecimal.toString() as any)
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
      tokenXAmount.value = ''
      tokenYAmount.value = ''
      updateBalances()
      const { poolId } = getPoolData(swapInfo.poolList)
      currentPrice.value = await getPoolPrice(poolId)
      setLowHighPrice()
    }
    const showPreviewModal = () => {
      if (btnMessage.value === 'preview' && !invalidRange.value) {
        const { poolId } = getPoolData(swapInfo.poolList)
        const lpId = getLpId(poolId, account.value, jsonConfig)
        duplicateLpId.value = store.state.lps.some(lp => lp.lpId === lpId)
        previewModalVisible.value = true
      }
    }
    const handleAdd = async () => {
      const penaltyResult = await getPenalty()
      const acc = account.value.startsWith('0x') ? ethers.utils.getAddress(account.value) : account.value
      if (penaltyResult.blackList[acc] !== undefined) {
        previewModalVisible.value = false
        store.commit('updatePenaltyModalVisible', true)
        const lps = [...store.state.lps]
        lps.forEach((lp) => {
          store.commit('removeLp', lp)
        })
        return
      }

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
      store.commit('updateAddPoolModalVisible', false)
      permaMessage({
        showClose: true,
        message: t('add_successful'),
        type: 'success',
        duration: 3000
      })
    }
    const reduceLowPrice = () => {
      if (lowPrice.value.trim() !== '0' && +lowPrice.value) {
        lowPrice.value = toBN(lowPrice.value).times(0.99).toString()
        tokenXAmount.value = ''
        tokenYAmount.value = ''
      }
    }
    const plusLowPirce = () => {
      if (lowPrice.value.trim() !== '0' && +lowPrice.value) {
        lowPrice.value = toBN(lowPrice.value).times(1.01).toString()
        tokenXAmount.value = ''
        tokenYAmount.value = ''
      }
    }
    const reduceHighPrice = () => {
      if (highPrice.value.trim() !== '∞' && +highPrice.value) {
        highPrice.value = toBN(highPrice.value).times(0.99).toString()
        tokenXAmount.value = ''
        tokenYAmount.value = ''
      }
    }
    const plusHighPrice = () => {
      if (highPrice.value.trim() !== '∞' && +highPrice.value) {
        highPrice.value = toBN(highPrice.value).times(1.01).toString()
        tokenXAmount.value = ''
        tokenYAmount.value = ''
      }
    }
    const showRegisterModal = () => {
      if (!isValidVersion(store.state.info.lpClientInfo['lp-javascript'].version)) {
        store.commit('updateDownloadModalVisible', true)
      } else {
        store.commit('updateRegisterModalVisible', true)
      }
    }
    const showDepositNoticeModal = () => {
      const tokens = []
      if (tokenXNotEnough.value) {
        tokens.push(tokenX.value)
      }
      if (tokenYNotEnough.value) {
        tokens.push(tokenY.value)
      }
      store.commit('updateDepositNoticeTokens', tokens as any)
      store.commit('updateDepositNoticeModalVisible', true)
    }
    const oppositePrice = computed(() => {
      return formatInputPrecision(toBN(1).dividedBy(currentPrice.value).toString(), 8)
    })
    return {
      dataLoading,
      tokenX,
      tokenY,
      tokenXBalance,
      tokenYBalance,
      tokenXAmount,
      tokenYAmount,
      pairs,
      selectPair,
      clearAll,
      pairModalVisible,
      lowPrice,
      highPrice,
      btnMessage,
      currentPrice,
      setFullRange,
      handleAmountXInput,
      handleAmountYInput,
      handleAdd,
      fullRangeNoticeVisible,
      previewModalVisible,
      setMaxTokenXAmount,
      setMaxTokenYAmount,
      showPreviewModal,
      hideAddPoolModal,
      reduceLowPrice,
      plusLowPirce,
      reduceHighPrice,
      plusHighPrice,
      invalidRange,
      showRegisterModal,
      oppositePrice,
      t,
      duplicateLpId,
      locale,
      showDepositNoticeModal,
      tokenXNotEnough,
      tokenYNotEnough,
      tokenXBalanceFormat,
      tokenYBalanceFormat
    }
  }
})
</script>

<template>
  <div style="width:864px;background: #161E1B;border-radius: 24px;" class="mx-auto p-8 relative mt-20">
    <div
      class="flex flex-row items-center justify-between pb-4 mb-6"
      style="border-bottom:1px solid rgba(255, 255, 255, 0.08);">
      <img
        src="@/images/back.png"
        style="width:14px;"
        class="cursor-pointer"
        @click="hideAddPoolModal">
      <span style="font-size: 20px;">{{ t('add_liquidity') }}</span>
      <span style="color: #79D483;" class="text-sm cursor-pointer" @click="clearAll">{{ t('clear_all') }}</span>
    </div>
    <div class="flex flex-row relative">
      <div
        v-if="dataLoading"
        class="w-full h-full absolute top-0 left-0 flex flex-row items-center justify-center"
        style="background: rgba(22, 30, 27, 0.6);z-index:11;"
      >
        <img src="@/images/icon-loading.png" class="w-10 h-10 animate-spin">
      </div>
      <div style="width:384px;" class="mr-8">
        <div class="mb-4">
          {{ t('select_pair') }}
        </div>
        <div class="flex flex-row items-center justify-between mb-4">
          <div
            class="p-2 border-box cursor-pointer flex flex-row items-center justify-between"
            style="background: #000A06;border-radius: 8px;font-size: 20px;width:184px;"
            @click="pairModalVisible = true"
          >
            <div class="flex flex-row items-center">
              <TokenLogo class="w-5 h-5 mr-1" :symbol="tokenX ? tokenX.symbol : ''" />
              {{ tokenX && tokenX.symbol }}
            </div>
            <img src="@/images/arrow-top.png" class="transform rotate-180 w-5">
          </div>
          <div
            class="p-2 border-box cursor-pointer flex flex-row items-center justify-between"
            style="background: #000A06;border-radius: 8px;font-size: 20px;width:184px;"
            @click="pairModalVisible = true"
          >
            <div class="flex flex-row items-center">
              <TokenLogo class="w-5 h-5 mr-1" :symbol="tokenY ? tokenY.symbol : ''" />
              {{ tokenY && tokenY.symbol }}
            </div>
            <img src="@/images/arrow-top.png" class="transform rotate-180 w-5">
          </div>
        </div>
        <div
          class="p-2 text-sm mb-6"
          style="border: 1px solid rgba(255, 255, 255, 0.08);border-radius: 8px;color: rgba(255, 255, 255, 0.65);">
          {{ t('fee_tip') }}
        </div>
        <div class="mb-4">
          {{ t('deposit_amounts') }}
        </div>
        <div>
          <div
            class="px-4 pt-4 pb-3 mb-2"
            style="background: #000A06;border-radius: 12px;">
            <div class="flex flex-row items-center justify-between">
              <div class="px-2 py-1" style="display:inline-block;background: rgba(24, 59, 33, 0.65);border-radius: 8px;">
                <TokenLogo class="w-4 h-4 mr-0.5 inline relative -top-0.5" :symbol="tokenX ? tokenX.symbol : ''" />
                {{ tokenX && tokenX.symbol }}
              </div>
              <InputArea
                class="amount-input"
                :input-text="tokenXAmount"
                :input-text-modifiers="{ precise: true }"
                placeholder="0.0"
                :precision="tokenX ? tokenX.decimals : 8"
                :text-right="true"
                style="width:200px;background:transparent;outline:none;text-align:right;font-size: 30px;"
                @update:inputText="handleAmountXInput" />
            </div>
            <div class="text-xs cursor-pointer">
              <span
                class="mr-0.5"
                style="color: #5AAD67;"
                @click="setMaxTokenXAmount"
              >{{ t('max') }}</span>
              <span
                style="color:rgba(255, 255, 255, 0.65)"
                @click="setMaxTokenXAmount"
              >{{ tokenXBalanceFormat }}</span>
              <span
                v-if="tokenXNotEnough"
                class="ml-2"
                style="color: #D3B078;"
                @click="showDepositNoticeModal">
                {{ t('deposit_2') }}
              </span>
            </div>
          </div>

          <div
            class="px-4 pt-4 pb-3 relative"
            style="background: #000A06;border-radius: 12px;">
            <img class="absolute w-6 h-6" src="@/images/deposit-amount-plus.png" style="left:50%;transform:translateX(-50%);top:-16px;">
            <div class="flex flex-row items-center justify-between">
              <div class="px-2 py-1" style="display:inline-block;background: rgba(24, 59, 33, 0.65);border-radius: 8px;">
                <TokenLogo class="w-4 h-4 mr-0.5 inline relative -top-0.5" :symbol="tokenY ? tokenY.symbol : ''" />
                {{ tokenY && tokenY.symbol }}
              </div>
              <InputArea
                class="amount-input"
                :input-text="tokenYAmount"
                :input-text-modifiers="{ precise: true }"
                placeholder="0.0"
                :precision="tokenY ? tokenY.decimals : 8"
                :text-right="true"
                style="width:200px;background:transparent;outline:none;text-align:right;font-size: 30px;"
                @update:inputText="handleAmountYInput" />
            </div>
            <div class="text-xs cursor-pointer">
              <span
                class="mr-0.5"
                style="color: #5AAD67;"
                @click="setMaxTokenYAmount"
              >
                {{ t('max') }}
              </span>
              <span
                style="color:rgba(255, 255, 255, 0.65)"
                @click="setMaxTokenYAmount"
              >{{ tokenYBalanceFormat }}</span>
              <span
                v-if="tokenYNotEnough"
                class="ml-2"
                style="color: #D3B078;"
                @click="showDepositNoticeModal">
                {{ t('deposit_2') }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style="width:384px;">
        <div class="mb-4">
          {{ t('set_price_range') }}
        </div>
        <div style="background: #000A06;border-radius: 12px;" class="text-center text-xs py-2 mb-4">
          <div style="color: rgba(255, 255, 255, 0.65);">
            {{ t('current_price') }}
          </div>
          <div class="my-2" style="font-size:20px;color: rgba(255, 255, 255, 0.85);">
            {{ currentPrice }} {{ tokenY && tokenY.symbol }} {{ t('per') }} {{ tokenX && tokenX.symbol }}
          </div>
          <div style="color: rgba(255, 255, 255, 0.65);">
            {{ oppositePrice }} {{ tokenX && tokenX.symbol }} {{ t('per') }} {{ tokenY && tokenY.symbol }}
          </div>
        </div>
        <div class="flex flex-row items-center justify-between mb-4 relative">
          <div class="p-2" style="background: #000A06;border-radius: 12px;width:182px;height:92px;box-sizing: border-box;">
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              {{ t('min_price') }}
            </div>
            <div class="flex flex-row items-center justify-between">
              <div
                class="w-6 h-6 flex flex-row items-center justify-center cursor-pointer"
                style="background: #161E1B;border-radius: 6px;"
                :style="lowPrice === '0' ? 'opacity:0.3;' : 'opacity:1;'"
                @click="reduceLowPrice"
              >
                -
              </div>
              <input
                v-model="lowPrice"
                placeholder="0.0"
                style="font-size: 20px;outline: none;width: 100px;text-align: center; background-color: transparent;"
                class="my-2"
              >
              <div
                class="w-6 h-6 flex flex-row items-center justify-center cursor-pointer"
                style="background: #161E1B;border-radius: 6px;"
                :style="lowPrice === '0' ? 'opacity:0.3;' : 'opacity:1;'"
                @click="plusLowPirce"
              >
                +
              </div>
            </div>
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              {{ tokenY && tokenY.symbol }} {{ t('per') }} {{ tokenX && tokenX.symbol }}
            </div>
          </div>
          <div class="p-2" style="background: #000A06;border-radius: 12px;width:182px;height:92px;box-sizing: border-box;">
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              {{ t('max_price') }}
            </div>
            <div class="flex flex-row items-center justify-between">
              <div
                class="w-6 h-6 flex flex-row items-center justify-center cursor-pointer"
                style="background: #161E1B;border-radius: 6px;"
                :style="highPrice === '∞' ? 'opacity:0.3;' : 'opacity:1;'"
                @click="reduceHighPrice"
              >
                -
              </div>
              <input
                v-model="highPrice"
                placeholder="0.0"
                style="font-size: 20px;outline: none;width: 100px;text-align: center; background-color: transparent;"
                class="my-2"
              >
              <div
                class="w-6 h-6 flex flex-row items-center justify-center cursor-pointer"
                style="background: #161E1B;border-radius: 6px;"
                :style="highPrice === '∞' ? 'opacity:0.3;' : 'opacity:1;'"
                @click="plusHighPrice"
              >
                +
              </div>
            </div>
            <div class="text-center text-xs" style="color: rgba(255, 255, 255, 0.65);">
              {{ tokenY && tokenY.symbol }} {{ t('per') }} {{ tokenX && tokenX.symbol }}
            </div>
          </div>
          <div
            v-if="fullRangeNoticeVisible"
            class="absolute px-3 py-4"
            style="background: rgba(67, 63, 33, 0.98);
                border: 1px solid rgba(255, 197, 61, 0.2);
                border-radius: 16px;
                top: 0;
                width: 100%;
                left: 0;"
            :style="locale === 'zh' ? 'padding-bottom:36px;' : ''">
            <div class="flex flex-row items-center text-xs mb-1">
              <img src="@/images/warn-2.png" class="w-4 h-4 mr-2"> <div>{{ t('full_range_tip_title') }}</div>
            </div>
            <div style="color: rgba(255, 255, 255, 0.65);line-height: 20px;" class="text-xs mb-6">
              {{ t('full_range_tip_detail') }}
            </div>
            <button
              class="text-xs"
              style="color:#000;background: #FFC53D;
                border: 1px solid rgba(121, 212, 131, 0.08);
                border-radius: 6px;padding: 1px 8px;"
              @click="setFullRange"
            >
              {{ t('full_range_tip_btn') }}
            </button>
          </div>
        </div>
        <div
          v-if="invalidRange"
          class="flex flex-row items-center py-1 px-3 text-xs mb-4"
          style="background: rgba(255, 197, 61, 0.2);border: 1px solid rgba(255, 197, 61, 0.2);border-radius: 8px;">
          <img src="@/images/warning.png" class="ml-1 mr-2 w-3">
          {{ t(invalidRange) }}
        </div>
        <div
          class="text-sm cursor-pointer"
          style="margin-bottom: 52px;padding: 6px 8px;background: rgba(24, 59, 33, 0.2);border: 1px solid #183B21;border-radius: 8px;text-align:center;"
          @click="fullRangeNoticeVisible = true"
        >
          {{ t('full_range') }}
        </div>
        <div
          v-if="btnMessage !== 'sign_up' && btnMessage !== 'preview' && btnMessage !== 'enter_amount'"
          class="py-3 text-center block"
          style="background: #79D483;color:#000;cursor:pointer;border-radius: 8px;"
          @click="showDepositNoticeModal"
        >
          {{ t('deposit') }}
        </div>
        <div
          v-else
          class="py-3 text-center"
          style="border-radius: 8px;"
          :style="(btnMessage === 'preview' && !invalidRange) || btnMessage === 'sign_up' ?
            'background: #79D483;color:#000;cursor:pointer' :
            'background: rgba(255, 255, 255, 0.12);color: rgba(255, 255, 255, 0.3);cursor:not-allowed'"
          @click="btnMessage === 'sign_up' ? showRegisterModal() : showPreviewModal()"
        >
          {{ t(btnMessage) }}
        </div>
        <!-- <div
          v-if="btnMessage !== 'sign_up' && btnMessage !== 'preview' && btnMessage !== 'enter_amount'"
          class="text-right text-xs mt-1"
        >
          <a href="https://app.everpay.io/deposit" target="_blank" style="color: #D3B078;">{{ t('deposit_2') }}</a>
        </div> -->
      </div>
    </div>
    <PairModal
      :class="pairModalVisible ? 'block' : 'hidden'"
      :pairs="pairs"
      @selectPair="selectPair"
      @closePairModal="pairModalVisible = false" />
    <PreviewModal
      :class="previewModalVisible ? 'block' : 'hidden'"
      :duplicate-lp-id="duplicateLpId"
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

<style lang="scss">
.amount-input {
  ::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
}
</style>
