<script>
import { defineComponent } from 'vue'
import TokenLogo from './TokenLogo.vue'

export default defineComponent({
  components: { TokenLogo },
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
          class="mb-4 py-4 px-4 cursor-pointer flex flex-row items-center justify-between"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;font-size: 20px;"
          @click="$emit('selectPair', pair)">
          <div class="flex flex-row items-center" style="width:200px">
            <TokenLogo :symbol="pair.tokenX.symbol" class="w-5 h-5 mr-2" />
            {{ pair.tokenX.symbol }}
          </div>
          <img src="@/images/arrow-right.png">
          <div class="flex flex-row items-center justify-end" style="width:200px">
            <TokenLogo :symbol="pair.tokenY.symbol" class="w-5 h-5 mr-2" />
            {{ pair.tokenY.symbol }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
