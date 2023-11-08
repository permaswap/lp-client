<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import { isProd } from '@/lib/swap'

export default defineComponent({
  setup () {
    const { t, locale } = useI18n()
    const store = useStore()
    const visible = computed(() => store.state.depositNoticeModalVisible)
    const tokens = computed(() => store.state.depositNoticeTokens)
    const depositUrlPrefix = `https://app${isProd ? '' : '-dev'}.everpay.io/deposit/`
    const hide = () => store.commit('updateDepositNoticeModalVisible', false)
    return {
      t,
      locale,
      visible,
      tokens,
      hide,
      depositUrlPrefix
    }
  }
})
</script>

<template>
  <div v-if="visible" class="fixed" style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0; z-index: 15;">
    <div
      style="
    position: fixed;
    background: #363F3B;
    box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);
    border-radius: 24px;
    width:480px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:24px;"
    >
      <div style="font-size: 17px;color:#79D483;" class="mb-4">
        {{ tokens.length === 2 ?
          t('deposit_notice_modal.title_with_2_symbol', {symbol1: tokens[0].symbol.toUpperCase(), symbol2: tokens[1].symbol.toUpperCase() }) :
          tokens.length === 1 ? t('deposit_notice_modal.title_with_symbol', { symbol: tokens[0].symbol.toUpperCase() }) : t('deposit_notice_modal.title_1')
        }}
      </div>
      <div class="mb-6">
        <ul class="list-disc pl-3">
          <li>
            <div class="text-white text-base">
              {{ t('deposit_notice_modal.notice_1') }}
            </div>
            <div class="text-sm" style="color:rgba(255, 255, 255, 0.65);">
              {{ t('deposit_notice_modal.notice_detail') }}
            </div>
          </li>
        </ul>
      </div>
      <div class="flex flex-row items-center justify-between">
        <div
          class="text-center text-sm box-border cursor-pointer"
          style="
          height:40px;
          line-height: 40px;
          color: #79D483;
          border-radius: 8px;
          border: 1px solid rgba(121, 212, 131, 0.20);"
          :style="tokens.length === 2 ? 'width:133px;' : 'width:208px;'"
          @click="hide">
          {{ tokens.length === 0 ? t('deposit_notice_modal.cancel_1') : t('deposit_notice_modal.cancel_2') }}
        </div>
        <a
          v-for="token in tokens"
          :key="token.tag"
          :href="`${depositUrlPrefix}${token.tag}`"
          target="_blank"
          class="text-center text-sm box-border cursor-pointer"
          style="
          height:40px;
          background-color: #79D483;
          color: #000;
          line-height: 40px;
          border-radius: 8px;"
          :style="tokens.length === 2 ? 'width:133px;' : 'width:208px;'"
          @click="hide">
          {{ t('deposit_notice_modal.deposit_symbol', { symbol: token.symbol.toUpperCase() }) }}
        </a>
        <a
          v-if="tokens.length === 0"
          :href="depositUrlPrefix"
          target="_blank"
          class="text-center text-sm box-border cursor-pointer"
          style="
          height:40px;
          background-color: #79D483;
          color: #000;
          width:208px;
          line-height: 40px;
          border-radius: 8px;"
          @click="hide">
          {{ t('deposit_notice_modal.deposit') }}
        </a>
      </div>
    </div>
  </div>
</template>
