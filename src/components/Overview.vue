<script>
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const store = useStore()
    const account = computed(() => store.state.account)
    const showRegisterModal = () => store.commit('updateRegisterModalVisible', true)
    const showAddPoolModal = () => store.commit('updateAddPoolModalVisible', true)
    return {
      account,
      showAddPoolModal,
      showRegisterModal
    }
  }
})
</script>

<template>
  <div style="width:864px;" class="mx-auto">
    <div style="font-size: 20px;" class="mb-6">
      Pool Overview
    </div>
    <div style="background: #161E1B;border-radius: 24px;" class="p-8">
      <div class="pb-4 flex flex-row items-center justify-between" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span>My Pool</span>
        <div v-if="account" class="flex flex-row items-center">
          <a
            class="text-sm px-4 py-1 border-box"
            style="color: #79D483;border: 1px solid #183B21;border-radius: 8px;"
            href="https://permaswap.network/#/nft"
            target="_blank">Collect NFT</a>
          <div
            class="text-sm px-4 py-1 border-box ml-6 cursor-pointer"
            style="color: #000;background: #79D483;border-radius: 8px;"
            @click="showAddPoolModal"
          >
            New Position
          </div>
        </div>
      </div>
      <div class="text-sm my-8 text-center" style="color: rgba(255, 255, 255, 0.45);">
        {{
          account ? 'Your active liquidity positions will appear here.' :
          'Hold NFT, register as a node, get more rewards！'
        }}
      </div>
      <div v-if="!account" class="flex flex-row items-center justify-center">
        <a
          class="text-sm px-4 py-1 border-box"
          style="color: #79D483;border: 1px solid #183B21;border-radius: 8px;"
          href="https://permaswap.network/#/nft"
          target="_blank">Collect NFT</a>
        <div
          class="text-sm px-4 py-1 border-box ml-12 cursor-pointer"
          style="color: #000;background: #79D483;border-radius: 8px;"
          @click="showRegisterModal"
        >
          Sign Up
        </div>
      </div>
    </div>
  </div>
</template>
