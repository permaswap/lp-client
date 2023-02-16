<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    inRange: {
      type: Boolean,
      default: true
    }
  },
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
    style="color: rgba(255, 255, 255, 0.85);border-radius: 8px;"
    class="text-sm flex flex-row items-center justify-center">
    <div
      class="mr-1"
      style="width: 6px;height: 6px;border-radius: 50%;"
      :style="inRange ? 'background: #52C763;' : 'background: #FFC53D;'" />
    <div>{{ inRange ? t('in_range') : t('out_of_range') }}</div>
  </div>
</template>
