<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    pairs: {
      type: Array,
      default: () => ([])
    }
  },
  emits: ['selectPair', 'closePairModal'],
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
    height:648px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:32px;">
      <div class="flex flex-row items-center justify-between pb-4 mb-6" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span style="font-size:20px;">Select Pair</span>
        <img src="@/images/close.png" class="cursor-pointer" @click="$emit('closePairModal')">
      </div>
      <div>
        <div
          v-for="(pair, index) in pairs"
          :key="index"
          class="mb-2 py-4 px-8 cursor-pointer"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;font-size: 20px;"
          @click="$emit('selectPair', pair)">
          {{ pair.tokenX.symbol }} - {{ pair.tokenY.symbol }}
        </div>
      </div>
    </div>
  </div>
</template>
