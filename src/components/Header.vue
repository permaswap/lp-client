<script lang="ts">
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const store = useStore()
    const account = computed(() => {
      return store.state.account
    })
    return {
      account
    }
  }
})
</script>

<template>
  <div>
    <div
      class="flex flex-row items-center justify-between px-16 py-6"
      style="background: #000A06;box-shadow: 0px 2px 24px rgba(24, 59, 33, 0.16);">
      <img class="h-8" src="@/images/logo.png">
      <div class="text-base" style="color: rgba(255, 255, 255, 0.85);">
        Pool Overview
      </div>
      <div
        class="flex flex-row items-center py-2 px-5 rounded-lg cursor-pointer"
        style="background: #183B21;border: 1px solid rgba(121, 212, 131, 0.25);">
        <img v-if="!account" class="h-4" src="@/images/person.png">
        <img v-else class="h-5" src="@/images/ethereum.png">
        <span class="px-2" style="color: rgba(255, 255, 255, 0.85);">
          {{ account ? account.slice(0, 6) + '...' + account.slice(-4) : 'Sign in' }}
        </span>
        <span class="block mr-2" style="width:1px;height:12px;background:rgba(255, 255, 255, 0.25);" />
        <img style="height:10.5px;" src="@/images/more.png">
      </div>
    </div>
  </div>
</template>
