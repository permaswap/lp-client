<script>
import { getAmountXY } from '@/lib/math'
import { getLpReward, getPoolPrice, sendRemove } from '@/lib/swap'
import { formatInputPrecision, isInRange, toBN } from '@/lib/util'
import { useStore } from '@/store'
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseConfirmModal from './closeConfirmModal.vue'
import Range from './Range.vue'
import TokenLogo from './TokenLogo.vue'
import { permaMessage } from './Message'
import permaBack from '../images/perma-back.png'
import NoticeTip from './NoticeTip.vue'

export default defineComponent({
  components: { CloseConfirmModal, Range, TokenLogo, NoticeTip },
  props: {
    lp: {
      type: Object,
      default: () => ({})
    },
    volume: {
      type: String,
      default: ''
    },
    tvl: {
      type: String,
      default: ''
    }
  },
  emits: ['back'],
  setup (props, context) {
    const currentPrice = ref('')
    const closeConfirmModalVisible = ref(false)
    const store = useStore()
    const confirmClose = () => {
      closeConfirmModalVisible.value = false
      sendRemove(props.lp)
      store.commit('removeLp', props.lp)
      context.emit('back')
      permaMessage({
        showClose: true,
        message: t('close_lp_successful'),
        type: 'success',
        duration: 3000
      })
    }
    const { t } = useI18n()
    const inRange = ref(true)
    const amountX = ref('')
    const amountY = ref('')
    const rewardX = ref('')
    const rewardY = ref('')
    const feesTipNoticeVisible = ref(false)
    // const totalPrice = ref('')

    onMounted(async () => {
      const amountXY = getAmountXY(props.lp.lowSqrtPrice, props.lp.currentSqrtPrice, props.lp.highSqrtPrice, props.lp.liquidity)
      amountX.value = toBN(amountXY.amountX).dividedBy(toBN(10).pow(props.lp.tokenXDecimal))
      amountY.value = toBN(amountXY.amountY).dividedBy(toBN(10).pow(props.lp.tokenYDecimal))
      // const marketPrices = await getMarketPrices('USD', [props.lp.tokenXSymbol, props.lp.tokenYSymbol])
      // totalPrice.value = marketPrices.reduce((memo, item, index) => {
      //   let itemAmountPrice = 0
      //   if (item.symbol.toLowerCase() === props.lp.tokenXSymbol.toLowerCase()) {
      //     itemAmountPrice = item.price * amountX.value
      //   } else if (item.symbol.toLowerCase() === props.lp.tokenYSymbol.toLowerCase()) {
      //     itemAmountPrice = item.price * amountY.value
      //   }
      //   console.log('itemAmountPrice', itemAmountPrice)
      //   return memo + itemAmountPrice
      // }, 0)
      const reward = await getLpReward(props.lp.lpId)
      rewardX.value = reward.rewardX ? formatInputPrecision(reward.rewardX.toString(), props.lp.tokenXDecimal) : '0'
      rewardY.value = reward.rewardY ? formatInputPrecision(reward.rewardY.toString(), props.lp.tokenYDecimal) : '0'

      currentPrice.value = await getPoolPrice(props.lp.poolId)
      inRange.value = isInRange(currentPrice.value, props.lp.lowPrice, props.lp.highPrice)
    })

    const oppositePrice = computed(() => {
      return formatInputPrecision(toBN(1).dividedBy(currentPrice.value).toString(), 8)
    })

    return {
      rewardX,
      rewardY,
      oppositePrice,
      permaBack,
      amountX,
      amountY,
      inRange,
      // totalPrice,
      confirmClose,
      closeConfirmModalVisible,
      currentPrice,
      feesTipNoticeVisible,
      t
    }
  }
})
</script>

<template>
  <div style="width:864px;margin-top: 60px;padding-bottom:100px;" class="mx-auto mt-20">
    <div class="flex flex-row items-center mb-7">
      <img src="@/images/back2.png" class="w-6 h-6 cursor-pointer" @click="$emit('back')">
      <div style="color: rgba(255, 255, 255, 0.65);" class="text-sm ml-2 cursor-pointer" @click="$emit('back')">
        {{ t('back_to_overview') }}
      </div>
    </div>
    <div class="flex flex-row items-center justify-between mb-4">
      <div class="flex flex-row items-center">
        <TokenLogo :symbol="lp.tokenXSymbol" class="w-6 h-6 -mr-2" :chain-type="lp.tokenXChainType" />
        <TokenLogo :symbol="lp.tokenYSymbol" class="w-6 h-6 mr-2" :chain-type="lp.tokenYChainType" />
        <div style="font-size:20px;">
          {{ lp.tokenXSymbol }}/{{ lp.tokenYSymbol }}
        </div>
        <Range :in-range="inRange" />
      </div>
      <div
        class="text-sm py-1 px-4 cursor-pointer"
        style="color: #79D483;border: 1px solid #183B21;border-radius: 8px;"
        @click="closeConfirmModalVisible = true">
        {{ t('close_lp_node') }}
      </div>
    </div>
    <div
      class="flex flex-row justify-between mb-6"
    >
      <div
        class="border-box px-4"
        :style="`
          width: 424px;
          height: 308px;
          background-image:url(${permaBack});
          background-position:top right;
          background-repeat: no-repeat;
          background-color: #161E1B;
          border-radius: 12px;
        `
        "
      >
        <div class="pt-4 pb-2 mb-4" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          {{ t('volume') }} (24h)
        </div>
        <div style="color: #FFFFFF;font-size: 28px;">
          {{ volume !== '-' ? `${volume} USD` : volume }}
        </div>
      </div>
      <div>
        <div class="border-box px-4 mb-4" style="width: 424px;height: 144px;background: #161E1B;border-radius: 12px;">
          <div
            class="pt-4 pb-2 mb-4 flex flex-row items-center justify-between"
            style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <span>{{ t('liquidity') }}</span>
            <span>{{ tvl !== '-' ? `${tvl} USD` : tvl }}</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm" style="color: rgba(255, 255, 255, 0.85);margin-bottom:22px;">
            <div class="flex flex-row items-center">
              <TokenLogo
                :symbol="lp.tokenXSymbol"
                class="mr-2"
                style="width:18px;height:18px;"
                :chain-type="lp.tokenXChainType" />
              <span>Pooled {{ lp.tokenXSymbol }}</span>
            </div>
            <span>{{ amountX ? amountX : '-' }}</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm mb-5" style="color: rgba(255, 255, 255, 0.85);">
            <div class="flex flex-row items-center">
              <TokenLogo
                :symbol="lp.tokenYSymbol"
                class="mr-2"
                style="width:18px;height:18px;"
                :chain-type="lp.tokenYChainType" />
              <span>Pooled {{ lp.tokenYSymbol }}</span>
            </div>
            <span>{{ amountY ? amountY : '-' }}</span>
          </div>
        </div>
        <div class="border-box px-4 mb-4" style="width: 424px;height: 144px;background: #161E1B;border-radius: 12px;">
          <div
            class="pt-4 pb-2 mb-4 flex flex-row items-center justify-between"
            style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <span class="relative cursor-pointer" @mouseover="feesTipNoticeVisible = true" @mouseleave="feesTipNoticeVisible = false">
              {{ t('fees') }}
              <NoticeTip v-if="feesTipNoticeVisible" :arrow-left="24" :left="-16">
                <ul style="list-style-type: disc;margin-left:20px;">
                  <li>{{ t('fees_tip_1') }}</li>
                  <li>{{ t('fees_tip_2') }}</li>
                </ul>
              </NoticeTip>
            </span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm" style="color: rgba(255, 255, 255, 0.85);margin-bottom:22px;">
            <div class="flex flex-row items-center">
              <TokenLogo
                :symbol="lp.tokenXSymbol"
                class="mr-2"
                style="width:18px;height:18px;"
                :chain-type="lp.tokenXChainType" />
              <span>{{ lp.tokenXSymbol }}</span>
            </div>
            <span>{{ rewardX ? rewardX : '-' }}</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm mb-5" style="color: rgba(255, 255, 255, 0.85);">
            <div class="flex flex-row items-center">
              <TokenLogo
                :symbol="lp.tokenYSymbol"
                class="mr-2"
                style="width:18px;height:18px;"
                :chain-type="lp.tokenYChainType" />
              <span>{{ lp.tokenYSymbol }}</span>
            </div>
            <span>{{ rewardY ? rewardY : '-' }}</span>
          </div>
        </div>
        <!-- <div
          class="flex flex-row items-center justify-between text-sm"
          style="background: #161E1B;border-radius: 12px;padding: 21px 16px;">
          <span>{{ t('volume') }} (24h)</span>
          <span>{{ volume !== '-' ? `${volume} USD` : volume }}</span>
        </div> -->
      </div>
    </div>
    <div>
      <div class="mb-4">
        {{ t('selected_range') }}
      </div>
      <div class="flex flex-row items-center justify-between text-center mb-4">
        <div style="background: #161E1B;border-radius: 12px;width:424px;" class="py-2">
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
            {{ t('min_price') }}
          </div>
          <div class="text-white my-1" style="font-size: 20px;">
            {{ lp.lowPrice }}
          </div>
          <div class="text-xs mb-2" style="color:rgba(255, 255, 255, 0.65);">
            {{ lp.tokenYSymbol }} {{ t('per') }} {{ lp.tokenXSymbol }}
          </div>
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.45);">
            {{ t('price_reached_$symbol', { symbol: lp.tokenXSymbol }) }}
          </div>
        </div>
        <div style="background: #161E1B;border-radius: 12px;width:424px;" class="py-2">
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
            {{ t('max_price') }}
          </div>
          <div class="text-white my-1" style="font-size: 20px;">
            {{ lp.highPrice }}
          </div>
          <div class="text-xs mb-2" style="color:rgba(255, 255, 255, 0.65);">
            {{ lp.tokenYSymbol }} {{ t('per') }} {{ lp.tokenXSymbol }}
          </div>
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.45);">
            {{ t('price_reached_$symbol', { symbol: lp.tokenYSymbol }) }}
          </div>
        </div>
      </div>
      <div
        class="text-center py-2"
        style="background: #161E1B;border-radius: 12px;color:rgba(255, 255, 255, 0.65);">
        <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
          {{ t('current_price') }}
        </div>
        <div class="text-white my-1" style="font-size: 20px;color:rgba(255, 255, 255, 0.85);">
          {{ currentPrice }} {{ lp.tokenYSymbol }} {{ t('per') }} {{ lp.tokenXSymbol }}
        </div>
        <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
          {{ oppositePrice }} {{ lp.tokenXSymbol }} {{ t('per') }} {{ lp.tokenYSymbol }}
        </div>
      </div>
    </div>
  </div>
  <CloseConfirmModal
    v-if="closeConfirmModalVisible"
    :lp="lp"
    :amount-x="amountX"
    :amount-y="amountY"
    @closeModal="closeConfirmModalVisible = false"
    @confirmClose="confirmClose" />
</template>
