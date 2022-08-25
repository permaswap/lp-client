<script>
import { getAmountXY } from '@/lib/lp'
import { getMarketPrices, getPoolPrice, sendRemove } from '@/lib/swap'
import { formatInputPrecision, isInRange, toBN } from '@/lib/util'
import { useStore } from '@/store'
import { defineComponent, onMounted, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CloseConfirmModal from './closeConfirmModal.vue'
import Range from './Range.vue'
import TokenLogo from './TokenLogo.vue'

export default defineComponent({
  components: { CloseConfirmModal, Range, TokenLogo },
  props: {
    lp: {
      type: Object,
      default: () => ({})
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
    }
    const { t } = useI18n()
    const inRange = ref(true)
    const amountX = ref('')
    const amountY = ref('')
    const totalPrice = ref('')

    onMounted(async () => {
      const amountXY = getAmountXY(props.lp.liquidity, props.lp.lowSqrtPrice, props.lp.currentSqrtPrice, props.lp.highSqrtPrice)
      amountX.value = toBN(amountXY.amountX).dividedBy(toBN(10).pow(props.lp.tokenXDecimal))
      amountY.value = toBN(amountXY.amountY).dividedBy(toBN(10).pow(props.lp.tokenYDecimal))
      const marketPrices = await getMarketPrices('USD', [props.lp.tokenXSymbol, props.lp.tokenYSymbol])
      totalPrice.value = marketPrices.reduce((memo, item, index) => {
        let itemAmountPrice = 0
        if (item.symbol.toLowerCase() === props.lp.tokenXSymbol.toLowerCase()) {
          itemAmountPrice = item.price * amountX.value
        } else if (item.symbol.toLowerCase() === props.lp.tokenYSymbol.toLowerCase()) {
          itemAmountPrice = item.price * amountY.value
        }
        console.log('itemAmountPrice', itemAmountPrice)
        return memo + itemAmountPrice
      }, 0)
      currentPrice.value = await getPoolPrice(props.lp.poolId, props.lp.tokenXDecimal, props.lp.tokenYDecimal)
      inRange.value = isInRange(currentPrice.value, props.lp.lowPrice, props.lp.highPrice)
    })

    const oppositePrice = computed(() => {
      return formatInputPrecision(toBN(1).dividedBy(currentPrice.value).toString(), 8)
    })

    return {
      oppositePrice,
      amountX,
      amountY,
      inRange,
      totalPrice,
      confirmClose,
      closeConfirmModalVisible,
      currentPrice,
      t
    }
  }
})
</script>

<template>
  <div style="width:864px;margin-top: 60px;" class="mx-auto">
    <div class="flex flex-row items-center mb-7">
      <img src="@/images/back.png" class="cursor-pointer" @click="$emit('back')">
      <div style="color: rgba(255, 255, 255, 0.65);" class="text-sm ml-2 cursor-pointer" @click="$emit('back')">
        {{ t('back_to_overview') }}
      </div>
    </div>
    <div class="flex flex-row items-center justify-between mb-4">
      <div class="flex flex-row items-center">
        <TokenLogo :symbol="lp.tokenXSymbol" class="w-6 h-6 -mr-2" />
        <TokenLogo :symbol="lp.tokenYSymbol" class="w-6 h-6 mr-2" />
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
    <div class="flex flex-row justify-between mb-6">
      <div class="border-box px-4" style="width: 424px;height: 222px;background: #161E1B;border-radius: 12px;">
        <div class="pt-4 pb-2 mb-4" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          {{ t('contribution_value') }}
        </div>
        <div style="color: rgba(255, 255, 255, 0.3);">
          {{ t('coming_soon') }}
        </div>
      </div>
      <div>
        <div class="border-box px-4 mb-6" style="width: 424px;height: 144px;background: #161E1B;border-radius: 12px;">
          <div
            class="pt-4 pb-2 mb-4 flex flex-row items-center justify-between"
            style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <span>{{ t('liquidity') }}</span>
            <span>{{ totalPrice ? `$${totalPrice}` : '-' }}</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm mb-5" style="color: rgba(255, 255, 255, 0.85);">
            <div class="flex flex-row items-center">
              <TokenLogo :symbol="lp.tokenXSymbol" class="w-4 h-4 mr-2" />
              <span>Pooled {{ lp.tokenXSymbol }}</span>
            </div>
            <span>{{ amountX ? amountX : '-' }}</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm mb-5" style="color: rgba(255, 255, 255, 0.85);">
            <div class="flex flex-row items-center">
              <TokenLogo :symbol="lp.tokenYSymbol" class="w-4 h-4 mr-2" />
              <span>Pooled {{ lp.tokenYSymbol }}</span>
            </div>
            <span>{{ amountY ? amountY : '-' }}</span>
          </div>
        </div>
        <div
          class="flex flex-row items-center justify-between text-sm p-4"
          style="background: #161E1B;border-radius: 12px;">
          <span>{{ t('volume') }}(24h)</span>
          <span>{{ totalPrice ? `$${totalPrice}` : '-' }}</span>
        </div>
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
            Your position will be 100% {{ lp.tokenXSymbol }} at this price.
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
            {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}
          </div>
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.45);">
            Your position will be 100% {{ lp.tokenYSymbol }} at this price.
          </div>
        </div>
      </div>
      <div
        class="text-center py-2"
        style="background: #161E1B;border-radius: 12px;color:rgba(255, 255, 255, 0.65);">
        <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
          {{ t('current_price') }}
        </div>
        <div class="text-white my-1" style="font-size: 20px;">
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
