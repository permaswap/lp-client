<script>
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import TokenLogo from './TokenLogo.vue'

export default defineComponent({
  components: { TokenLogo },
  props: {
    lp: {
      type: Object,
      default: () => ({})
    },
    amountX: {
      type: String,
      default: ''
    },
    amountY: {
      type: String,
      default: ''
    }
  },
  emits: ['closeModal', 'confirmClose'],
  setup () {
    const { t, locale } = useI18n()
    return {
      t,
      locale
    }
  }
})
</script>

<template>
  <div class="fixed" style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;">
    <div
      style="
    position: fixed;
    background: #242D2A;
    box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);
    border-radius: 24px;
    width:480px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:32px;"
      :style="locale === 'zh' ? 'height:332px;' : 'height:352px;'">
      <div class="flex flex-row items-center justify-between pb-4 mb-6" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span style="font-size:20px;">{{ t('close_lp_node') }}</span>
        <img src="@/images/close.png" class="cursor-pointer" @click="$emit('closeModal')">
      </div>
      <div class="flex flex-row items-center justify-between mb-4 text-sm" style="color: rgba(255, 255, 255, 0.85);">
        <div class="flex flex-row items-center">
          <TokenLogo :symbol="lp.tokenXSymbol" class="w-4 h-4 mr-2" :chain-type="lp.tokenXChainType" />
          <span>Pooled {{ lp.tokenXSymbol }}</span>
        </div>
        <span>{{ amountX ? amountX : '-' }}</span>
      </div>
      <div class="flex flex-row items-center justify-between text-sm mb-6" style="color: rgba(255, 255, 255, 0.85);">
        <div class="flex flex-row items-center">
          <TokenLogo :symbol="lp.tokenYSymbol" class="w-4 h-4 mr-2" :chain-type="lp.tokenYChainType" />
          <span>Pooled {{ lp.tokenYSymbol }}</span>
        </div>
        <span>{{ amountY ? amountY : '-' }}</span>
      </div>
      <div class="text-sm mb-8" style="color: #FFC53D;">
        {{ t('close_lp_notice') }}
      </div>
      <div class="flex flex-row items-center justify-between">
        <div
          class="text-center text-sm cursor-pointer"
          style="
          width:196px;
          height:40px;
          line-height: 40px;
          color: #FFC53D;
          border: 1px solid rgba(255, 197, 61, 0.25);;
          border-radius: 8px;"
          @click="$emit('closeModal')">
          {{ t('think_again') }}
        </div>
        <div
          class="text-center text-sm cursor-pointer"
          style="
          width:196px;
          height:40px;
          line-height: 40px;
          color: #000000;
          background: #FFC53D;
          border: 1px solid rgba(121, 212, 131, 0.08);
          border-radius: 8px;"
          @click="$emit('confirmClose')">
          {{ t('close_anyway') }}
        </div>
      </div>
    </div>
  </div>
</template>
