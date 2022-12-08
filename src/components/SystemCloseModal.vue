<script>
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  emits: ['closeModal'],
  setup (props) {
    const { t } = useI18n()
    const store = useStore()
    const closed = computed(() => store.state.info.status === 'closed')
    return {
      t,
      closed
    }
  }
})
</script>

<template>
  <div
    v-if="closed"
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;z-index: 100;">
    <div
      class="flex flex-col items-center justify-center"
      style="
    position: fixed;
    background: #363F3B;
    box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);
    border-radius: 20px;
    width:500px;
    height:308px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:48px;"
    >
      <div style="font-size:20px;" class="mb-2 text-center">
        {{ t('closed_title') }}
      </div>
      <div class="text-center">
        {{ t('closed_tip') }}
      </div>
    </div>
  </div>
</template>
