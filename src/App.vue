<script setup lang="ts">
import { ref, onMounted } from 'vue'
const scrollTop = ref(0)

// eslint-disable-next-line no-unused-vars
const windowWidth = ref(document.documentElement.offsetWidth)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrollTop.value = document.documentElement.scrollTop
  })
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
