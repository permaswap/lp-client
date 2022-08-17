<script>
import { getPoolPrice, sendRemove } from '@/lib/swap'
import { isInRange } from '@/lib/util'
import { useStore } from '@/store'
import { defineComponent, onMounted, ref } from 'vue'
import CloseConfirmModal from './closeConfirmModal.vue'
import Range from './Range.vue'

export default defineComponent({
  components: { CloseConfirmModal, Range },
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
    const inRange = ref(true)

    onMounted(async () => {
      currentPrice.value = await getPoolPrice(props.lp.poolId, props.lp.tokenXDecimal, props.lp.tokenYDecimal)
      inRange.value = isInRange(currentPrice.value, props.lp.lowPrice, props.lp.highPrice)
    })

    return {
      inRange,
      confirmClose,
      closeConfirmModalVisible,
      currentPrice
    }
  }
})
</script>

<template>
  <div style="width:864px;margin-top: 60px;" class="mx-auto">
    <div class="flex flex-row items-center mb-7">
      <img src="@/images/back.png" class="cursor-pointer" @click="$emit('back')">
      <div style="color: rgba(255, 255, 255, 0.65);" class="text-sm ml-2 cursor-pointer" @click="$emit('back')">
        Back to Pool Overview
      </div>
    </div>
    <div class="flex flex-row items-center justify-between mb-4">
      <div class="flex flex-row items-center">
        <div style="font-size:20px;">
          {{ lp.tokenXSymbol }}/{{ lp.tokenYSymbol }}
        </div>
        <Range :in-range="inRange" />
      </div>
      <div
        class="text-sm py-1 px-4 cursor-pointer"
        style="color: #79D483;border: 1px solid #183B21;border-radius: 8px;"
        @click="closeConfirmModalVisible = true">
        Close Lp Node
      </div>
    </div>
    <div class="flex flex-row justify-between mb-6">
      <div class="border-box px-4" style="width: 424px;height: 222px;background: #161E1B;border-radius: 12px;">
        <div class="pt-4 pb-2 mb-4" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
          Transaction Donate
        </div>
        <div style="color: rgba(255, 255, 255, 0.3);">
          Coming Soon
        </div>
      </div>
      <div>
        <div class="border-box px-4 mb-6" style="width: 424px;height: 144px;background: #161E1B;border-radius: 12px;">
          <div
            class="pt-4 pb-2 mb-4 flex flex-row items-center justify-between"
            style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <span>Liquidity</span>
            <span>-</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm mb-5" style="color: rgba(255, 255, 255, 0.85);">
            <span>Pooled {{ lp.tokenXSymbol }}</span>
            <span>-</span>
          </div>
          <div class="flex flex-row items-center justify-between text-sm mb-5" style="color: rgba(255, 255, 255, 0.85);">
            <span>Pooled {{ lp.tokenYSymbol }}</span>
            <span>-</span>
          </div>
        </div>
        <div
          class="flex flex-row items-center justify-between text-sm p-4"
          style="background: #161E1B;border-radius: 12px;">
          <span>Volume</span>
          <span>-</span>
        </div>
      </div>
    </div>
    <div>
      <div class="mb-4">
        Selected Range
      </div>
      <div class="flex flex-row items-center justify-between text-center mb-4">
        <div style="background: #161E1B;border-radius: 12px;width:424px;" class="py-2">
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
            Min Price
          </div>
          <div class="text-white my-1" style="font-size: 20px;">
            {{ lp.lowPrice }}
          </div>
          <div class="text-xs mb-2" style="color:rgba(255, 255, 255, 0.65);">
            {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}
          </div>
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.45);">
            Your position will be 100% {{ lp.tokenXSymbol }} at this price.
          </div>
        </div>
        <div style="background: #161E1B;border-radius: 12px;width:424px;" class="py-2">
          <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
            Max Price
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
          Current Price
        </div>
        <div class="text-white my-1" style="font-size: 20px;">
          {{ currentPrice }} {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}
        </div>
        <div class="text-xs" style="color:rgba(255, 255, 255, 0.65);">
          {{ 1 / currentPrice }} {{ lp.tokenXSymbol }} per {{ lp.tokenYSymbol }}
        </div>
      </div>
    </div>
  </div>
  <CloseConfirmModal
    v-if="closeConfirmModalVisible"
    :lp="lp"
    @closeModal="closeConfirmModalVisible = false"
    @confirmClose="confirmClose" />
</template>
