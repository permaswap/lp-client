<script>
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import TokenLogo from './TokenLogo.vue'
import Range from './Range.vue'
import { isInRange } from '@/lib/util'

export default defineComponent({
  components: { TokenLogo, Range },
  emits: ['selectLp'],
  setup () {
    const store = useStore()
    const account = computed(() => store.state.account)
    const showRegisterModal = () => store.commit('updateRegisterModalVisible', true)
    const showAddPoolModal = () => store.commit('updateAddPoolModalVisible', true)
    const lps = computed(() => store.state.lps)
    return {
      lps,
      isInRange,
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
    <div style="background: #161E1B;border-radius: 24px;" class="p-4">
      <div class="m-4 pb-4 flex flex-row items-center justify-between" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span>My Pool {{ lps.length ? `(${lps.length})` : '' }}</span>
        <div class="flex flex-row items-center">
          <a
            v-if="account"
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
        <ul v-if="lps.length && account" class="text-left">
          <li class="flex flex-row mb-2 px-4">
            <div style="width: 160px;margin-right:35px;">
              Name
            </div>
            <div class="mr-8" style="width:160px;" />
            <div class="text-right mr-8" style="width:100px;">
              Volume
            </div>
            <div class="text-right mr-8" style="width:100px;">
              TVL
            </div>
            <div />
          </li>
          <li
            v-for="(lp, index) in lps"
            :key="index"
            class="flex flex-row items-center p-4 cursor-pointer item"
            style="border-radius: 12px;"
            @click="$emit('selectLp', lp)"
          >
            <div class="text-white flex flex-row items-center" style="width: 160px;margin-right:35px;">
              <div style="width:40px;height:40px;" class="relative mr-2">
                <TokenLogo :symbol="lp.tokenXSymbol" class="w-8 h-8" />
                <TokenLogo :symbol="lp.tokenYSymbol" class="w-5 h-5 absolute bottom-0 right-0" />
              </div>
              {{ lp.tokenXSymbol }}/{{ lp.tokenYSymbol }}
            </div>
            <div class="mr-8 text-xs" style="width:160px;">
              <div>Min:{{ lp.lowPrice }} {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}</div>
              <img src="@/images/arrow-both.png">
              <div>Max:{{ lp.highPrice }} {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}</div>
            </div>
            <div class="text-right mr-8 text-white" style="width:100px;">
              -
            </div>
            <div class="text-right mr-8 text-white" style="width:100px;">
              -
            </div>
            <div class="flex flex-row items-center justify-end flex-1">
              <Range :in-range="isInRange(lp.currentSqrtPrice, lp.lowSqrtPrice, lp.highSqrtPrice)" />
            </div>
          </li>
        </ul>
        <span v-else-if="account">Your active liquidity positions will appear here.</span>
        <span v-else>Hold NFT, register as a node, get more rewards！</span>
      </div>
      <div v-if="!account" class="flex flex-row items-center justify-center pb-4">
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

<style lang="scss" scoped>
  .item {
    &:hover {
      background: rgba(54, 63, 59, 0.3);
    }
  }
</style>
