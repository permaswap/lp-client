<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    items: {
      type: Array as any,
      default: () => ([])
    }
  },
  emits: ['close'],
  setup () {
    const { t } = useI18n()
    return {
      t
    }
  }
})
</script>

<template>
  <div
    class="absolute p-4"
    style="
      z-index: 2;
      height:242px;
      width:320px;
      background: #242D2A;
      box-shadow: 0px 1px 2px -2px rgba(0, 10, 6, 0.16), 0px 3px 6px rgba(0, 10, 6, 0.12), 0px 5px 12px 4px rgba(0, 10, 6, 0.09);
      border-radius: 16px;
      top:32px;
      right:0px"
  >
    <div class="flex flex-row items-center justify-between pb-2 mb-2" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div class="text-sm">
        Top 5
      </div>
      <img src="@/images/cancel2.png" class="w-4 h-4 cursor-pointer" @click="$emit('close')">
    </div>
    <div class="flex flex-row items-center justify-between text-sm" style="color: rgba(255, 255, 255, 0.65);">
      <div>{{ t('trade_overview.address') }}</div>
      <div>{{ t('trade_overview.est_rewards') }}</div>
    </div>
    <ul v-if="items.length" class="text-sm">
      <li v-for="(item, index) in items" :key="index" class="mt-2 flex flex-row items-center justify-between">
        <div>{{ item.accid }}</div>
        <div>{{ item.reward }}</div>
      </li>
    </ul>
    <div v-else class="mt-12 text-sm text-center" style="color:rgba(255, 255, 255, 0.45)">
      {{ t('trade_overview.no_data') }}
    </div>
  </div>
</template>
