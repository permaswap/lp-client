<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  emits: ['closeModal', 'confirmDisconnect'],
  setup () {
    const seconds = ref(5)
    const disable = ref(true)
    onMounted(() => {
      const timer = () => {
        setTimeout(() => {
          if (seconds.value > 0) {
            seconds.value -= 1
            if (seconds.value === 0) {
              disable.value = false
            }
            timer()
          } else {
            disable.value = false
          }
        }, 1000)
      }
      timer()
    })
    return {
      seconds,
      disable
    }
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
    height:160px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:32px;">
      <div class="flex flex-row items-center mb-8">
        <img src="@/images/warn.png" class="mr-2">
        You won't get PSN bonus, after closing the Node!
      </div>
      <div class="flex flex-row items-center justify-center">
        <div
          class="text-center text-sm cursor-pointer mr-8"
          style="
          width:156px;
          height:40px;
          line-height: 40px;
          color: #FFC53D;
          border: 1px solid rgba(255, 197, 61, 0.25);;
          border-radius: 8px;"
          @click="$emit('closeModal')">
          Think Again
        </div>
        <div
          class="text-center text-sm border-box"
          :class="disable ? 'cursor-not-allowed' : 'cursor-pointer'"
          style="
          width:156px;
          height:40px;
          line-height: 40px;
          border-radius: 8px;"
          :style="disable ?
            `color: rgba(255, 255, 255, 0.3);background: rgba(255, 255, 255, 0.12);` :
            `color: #000000;background: #FFC53D;border: 1px solid rgba(121, 212, 131, 0.08);`"
          @click="!disable ? $emit('confirmDisconnect') : (() => {})">
          Close Anyway{{ seconds ? `(${seconds}s)` : '' }}
        </div>
      </div>
    </div>
  </div>
</template>
