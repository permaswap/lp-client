<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup

import { onMounted, ref } from 'vue'

const scrollTop = ref(0)
const windowWidth = ref(document.documentElement.offsetWidth)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrollTop.value = document.documentElement.scrollTop
  })

  window.addEventListener('resize', () => {
    windowWidth.value = document.documentElement.offsetWidth
  })
})
</script>

<template>
  <div class="bg-black text-white">
    1234
  </div>
</template>
