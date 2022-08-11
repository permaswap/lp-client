<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    tokenX: {
      type: Object,
      default: () => ({})
    },
    tokenY: {
      type: Object,
      default: () => ({})
    },
    tokenXAmount: {
      type: String,
      default: ''
    },
    tokenYAmount: {
      type: String,
      default: ''
    },
    lowPrice: {
      type: String,
      default: ''
    },
    highPrice: {
      type: String,
      default: ''
    },
    currentPrice: {
      type: String,
      default: ''
    }
  },
  emits: ['confirm', 'closeModal'],
  setup (props) {
    console.log(props.pairs)
  }
})
</script>

<template>
  <div class="fixed" style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;">
    <div
      style="
    position: fixed;
    background: #363F3B;
    box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);
    border-radius: 24px;
    width:480px;
    height:612px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:32px;">
      <div class="flex flex-row items-center justify-between pb-4 mb-6" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span style="font-size:20px;">Add Liquidity</span>
        <img src="@/images/close.png" class="cursor-pointer" @click="$emit('closeModal')">
      </div>
      <div class="mb-4" style="font-size:20px;">
        {{ tokenX && tokenX.symbol }}/{{ tokenY && tokenY.symbol }}
      </div>
      <div class="p-4 mb-6" style="background: rgba(22, 30, 27, 0.85);border-radius: 12px;">
        <div class="flex flex-row items-center justify-between">
          <span>Pooled {{ tokenX && tokenX.symbol }}</span>
          <span>{{ tokenXAmount }}</span>
        </div>
        <div class="flex flex-row items-center justify-between">
          <span>Pooled {{ tokenY && tokenY.symbol }}</span>
          <span>{{ tokenYAmount }}</span>
        </div>
      </div>
      <div class="mb-4">
        Selected Range
      </div>
      <div class="flex flex-row justify-between mb-2">
        <div
          class="text-center border-box p-2"
          style="
              background: rgba(22, 30, 27, 0.85);
              width: 204px;
              height: 92px;
              border-radius: 12px;">
          <div class="text-xs" style="opacity:0.65">
            Min Price
          </div>
          <div style="font-size:20px;" class="my-1">
            {{ lowPrice }}
          </div>
          <div class="text-xs" style="opacity:0.65">
            {{ tokenY && tokenY.symbol }} per {{ tokenX && tokenX.symbol }}
          </div>
        </div>
        <div
          class="text-center border-box p-2"
          style="
              background: rgba(22, 30, 27, 0.85);
              width: 204px;
              height: 92px;
              border-radius: 12px;">
          <div class="text-xs" style="opacity:0.65">
            Max Price
          </div>
          <div style="font-size:20px;" class="my-1">
            {{ highPrice }}
          </div>
          <div class="text-xs" style="opacity:0.65">
            {{ tokenY && tokenY.symbol }} per {{ tokenX && tokenX.symbol }}
          </div>
        </div>
      </div>
      <div
        class="text-center border-box p-2 mb-8"
        style="
            background: rgba(22, 30, 27, 0.85);
            height: 92px;
            border-radius: 12px;">
        <div class="text-xs" style="opacity:0.65">
          Current Price
        </div>
        <div style="font-size:20px;" class="my-1">
          {{ currentPrice }} {{ tokenY && tokenY.symbol }} per {{ tokenX && tokenX.symbol }}
        </div>
        <div class="text-xs" style="opacity:0.65">
          {{ 1 / currentPrice }} {{ tokenX && tokenX.symbol }} per {{ tokenY && tokenY.symbol }}
        </div>
      </div>
      <div
        class="cursor-pointer"
        style="color:#000;text-align:center;background: #79D483;border-radius: 8px;height:48px;line-height:48px;"
        @click="$emit('confirm')"
      >
        Become LP Node
      </div>
    </div>
  </div>
</template>
