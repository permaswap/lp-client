<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    left: {
      type: Number,
      default: 0
    },
    bottom: {
      type: Number,
      default: 36
    },
    arrowLeft: {
      type: Number,
      default: 32
    }
  }
})
</script>

<template>
  <div
    class="p-3 absolute left-0 text-xs border-box"
    style="background: #363F3B;border-radius: 12px;width:320px;color:#fff;z-index: 1;"
    :style="`left:${left}px;bottom:${bottom}px;`">
    <slot />
    <img
      src="@/images/arrow-2.png"
      class="absolute"
      style="width:18px;height:8px;bottom:-8px;"
      :style="`left:${arrowLeft}px;`">
  </div>
</template>
