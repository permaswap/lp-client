<script lang="ts">
import { isProd } from '@/lib/swap'
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
      store.commit('updateMiningModalVisible', false)
    }
    const showMiningModal = () => {
      store.commit('updateAccountModalVisible', false)
      store.commit('updateMiningModalVisible', true)
    }
    return {
      t,
      isProd,
      account,
      showMiningModal,
      showAccountModal
    }
  }
})
</script>

<template>
  <div class="h-20">
    <div
      class="flex flex-row items-center justify-between px-16 py-6 fixed w-full"
      style="background: #000A06;z-index: 9;">
      <div class="flex flex-row items-end">
        <img class="h-8" src="@/images/logo.png">
        <span
          class="text-xs ml-2 border rounded px-1 leading-5"
          style="color:rgba(255, 255, 255, 0.65);border-color:rgba(121, 212, 131, 0.25)"
        >{{ isProd ? 'Beta' : 'Testnet' }}</span>
      </div>
      <div class="text-base" :style="selectOverview ? 'color: #79D483;' : 'color: rgba(255, 255, 255, 0.85);'">
        {{ t('pool_overview') }}
      </div>
      <div class="flex flex-row items-center">
        <!-- <div
          class="flex flex-row items-center py-2 px-3 rounded-lg cursor-pointer mining-modal-trigger"
          style="border: 1px solid rgba(121, 212, 131, 0.25);"
          @click="showMiningModal"
        >
          <img src="@/images/trophy.png" class="w-6 h-6 mr-1">
          <span style="color:rgba(255, 255, 255, 0.85);" class="text-base">HALO</span>
        </div>
        <div style="height:28px;width:1px;background: rgba(121, 212, 131, 0.25);" class="mx-3" /> -->
        <div
          class="flex flex-row items-center py-2 px-5 rounded-lg cursor-pointer account-modal-trigger"
          style="background: #183B21;border: 1px solid rgba(121, 212, 131, 0.25);"
          @click="showAccountModal">
          <img v-if="!account" class="h-4" src="@/images/person.png">
          <img v-else-if="account.startsWith('0x')" class="h-5" src="@/images/ethereum.png">
          <img v-else class="h-5" src="@/images/arweave.png">
          <span class="px-2" style="color: rgba(255, 255, 255, 0.85);">
            {{ account ? account.slice(0, 6) + '...' + account.slice(-4) : t('sign_up') }}
          </span>
          <span class="block mr-2" style="width:1px;height:12px;background:rgba(255, 255, 255, 0.25);" />
          <img style="height:10.5px;" src="@/images/more.png">
        </div>
      </div>
    </div>
  </div>
</template>
