<template>
  <div class="flex flex-row items-center justify-between">
    <div class="text-sm flex flex-row items-center">
      <span style="color:rgba(255, 255, 255, 0.65);">{{ label }}</span>
      <div
        v-if="infoMessage"
        class="w-4 h-4 relative ml-1"
        @mouseover="noticeVisible = true"
        @mouseleave="noticeVisible = false"
      >
        <img src="@/images/icon-info.png" class="w-4 h-4 cursor-pointer">
        <NoticeTip
          v-if="noticeVisible"
          :left="-34"
          :bottom="32"
          :width="260">
          {{ infoMessage }}
        </NoticeTip>
      </div>
    </div>
    <div class="text-base" :style="`color:${highlight ? '#79D483' : '#fff'};`">
      {{ value }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import NoticeTip from './NoticeTip.vue'

export default defineComponent({
  components: { NoticeTip },
  props: {
    infoMessage: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    highlight: {
      type: Boolean,
      default: false
    }
  },
  setup () {
    const noticeVisible = ref(false)
    return {
      noticeVisible
    }
  }
})
</script>
