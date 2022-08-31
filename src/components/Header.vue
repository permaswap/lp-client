<script lang="ts">
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    selectOverview: {
      type: Boolean,
      default: false
    }
  },
  setup () {
    const store = useStore()
    const { t } = useI18n()
    const account = computed(() => {
      return store.state.account
    })
    const showAccountModal = () => {
      store.commit('updateAccountModalVisible', true)
    }
    return {
      t,
      account,
      showAccountModal
    }
  }
})
</script>

<template>
  <div
    class="flex flex-row items-center justify-between px-16 py-6 relative"
    style="background: #000A06;box-shadow: 0px 2px 24px rgba(24, 59, 33, 0.16);">
    <img class="h-8" src="@/images/logo.png">
    <div class="text-base" :style="selectOverview ? 'color: #79D483;' : 'color: rgba(255, 255, 255, 0.85);'">
      {{ t('pool_overview') }}
    </div>
    <div
      class="flex flex-row items-center py-2 px-5 rounded-lg cursor-pointer"
      style="background: #183B21;border: 1px solid rgba(121, 212, 131, 0.25);"
      @click="showAccountModal">
      <img v-if="!account" class="h-4" src="@/images/person.png">
      <img v-else class="h-5" src="@/images/ethereum.png">
      <span class="px-2" style="color: rgba(255, 255, 255, 0.85);">
        {{ account ? account.slice(0, 6) + '...' + account.slice(-4) : t('sign_up') }}
      </span>
      <span class="block mr-2" style="width:1px;height:12px;background:rgba(255, 255, 255, 0.25);" />
      <img style="height:10.5px;" src="@/images/more.png">
    </div>
  </div>
</template>
