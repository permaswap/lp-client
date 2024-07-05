<script>
import { useStore } from '@/store'
import { ref, computed, defineComponent, onMounted } from 'vue'
import TokenLogo from './TokenLogo.vue'
import Range from './Range2.vue'
import { toBN, isSqrtInRange, isValidVersion } from '@/lib/util'
import { useI18n } from 'vue-i18n'
import { getStats } from '@/lib/swap'
// import Dashboard from './Dashboard.vue'
// import TradeOverview from './TradeOverview.vue'

export default defineComponent({
  components: { TokenLogo, Range },
  emits: ['selectLp'],
  setup () {
    const store = useStore()
    const { t } = useI18n()
    const account = computed(() => store.state.account)
    const showRegisterModal = () => {
      if (!isValidVersion(store.state.info.lpClientInfo['lp-javascript'].version)) {
        store.commit('updateDownloadModalVisible', true)
      } else {
        store.commit('updateRegisterModalVisible', true)
      }
    }
    const showAddPoolModal = () => store.commit('updateAddPoolModalVisible', true)
    const lps = computed(() => store.state.lps)
    const volumesStack = ref({})
    const tvlsStack = ref({})
    const rewardStack = ref({})
    const successConnect = computed(() => store.state.successConnect)
    const manualConnect = computed(() => store.state.manualConnect)
    const showConnectTip = ref(false)

    onMounted(async () => {
      if (lps.value.length) {
        const result = await getStats(account.value)
        console.log('result', result)
        volumesStack.value = {}
        tvlsStack.value = {}
        result.volumes.forEach(volumeData => {
          volumesStack.value[volumeData.lpID] = `$${toBN(volumeData.volumeInUSD).toFixed(2)}`
          rewardStack.value[volumeData.lpID] = volumeData.rewardInUSD >= 0.01
            ? `$${toBN(volumeData.rewardInUSD).toFixed(2)}`
            : '<$0.01'
        })
        result.tvls.forEach(tvlData => {
          tvlsStack.value[tvlData.lpID] = `$${toBN(tvlData.tvlInUSD).toFixed(2)}`
        })
      }
    })

    return {
      t,
      lps,
      isSqrtInRange,
      successConnect,
      manualConnect,
      showConnectTip,
      account,
      volumesStack,
      rewardStack,
      tvlsStack,
      showAddPoolModal,
      showRegisterModal
    }
  }
})
</script>

<template>
  <!-- <TradeOverview /> -->
  <!-- <Dashboard /> -->
  <div style="width:864px;" class="mx-auto mt-16">
    <div style="font-size: 20px;" class="mb-6 flex flex-row items-center justify-between">
      <div>{{ t('pool_overview_2') }}</div>

      <div class="flex flex-row items-center">
        <a
          v-if="account"
          class="text-sm px-4 py-1 border-box"
          style="color: #79D483;border: 1px solid #183B21;border-radius: 8px;"
          href="https://app.permaswap.network/#/nft"
          target="_blank">{{ t('collect_nft') }}</a>
        <div
          class="text-sm px-4 py-1 border-box ml-6 cursor-pointer flex flex-row items-center"
          style="color: #000;background: #79D483;border-radius: 8px;"
          @click="showAddPoolModal"
        >
          <img src="@/images/plus.png" class="w-2 h-2 mr-2">
          {{ t('new_position') }}
        </div>
      </div>
    </div>
    <div style="background: #161E1B;border-radius: 24px;" class="px-3 py-4">
      <div class="my-3 mx-3 pb-4 flex flex-row items-center justify-between" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <span>{{ t('my_pool') }} {{ lps.length ? `(${lps.length})` : '' }}</span>
        <div
          v-if="manualConnect"
          class="flex flex-row items-center justify-end">
          <div
            v-if="showConnectTip"
            class="flex flex-row items-center justify-end text-xs mr-2"
            style="padding: 4px 8px;border-radius: 6px;"
            :style="successConnect ? 'background: rgba(82, 199, 99, 0.25);' : 'background: rgba(255, 125, 105, 0.25);'"
          >
            <div>{{ successConnect ? t('normal_connect') : t('connecting') }}</div>
            <img
              src="@/images/cancel.png"
              class="w-4 h-4 ml-2 cursor-pointer"
              @click="showConnectTip = false"
            >
          </div>
          <div
            class="relative cursor-pointer"
            style="width: 14px;height: 14px;"
            @click="showConnectTip = true"
          >
            <div
              class="absolute rounded-full breath"
              style="width: 14px;height: 14px;opacity: 0.45;"
              :style="successConnect ? 'background: #52C763;' : 'background: #FF7D69;'"
            />
            <div
              class="absolute rounded-full"
              style="width: 8px;height: 8px;top:3px;left:3px;"
              :style="successConnect ? 'background: #52C763;' : 'background: #FF7D69;'"
            />
          </div>
        </div>
      </div>
      <div class="text-sm my-6 text-center" style="color: rgba(255, 255, 255, 0.45);">
        <ul v-if="lps.length && account" class="text-left">
          <li class="flex flex-row mb-4 px-3 text-xs">
            <div style="width: 160px;" class="py-3">
              {{ t('name') }}
            </div>
            <div style="width:200px;" />
            <div class="text-right p-3" style="width:125px;">
              TVL
            </div>
            <div class="text-right p-3" style="width:125px;">
              {{ t('volume') }} (24h)
            </div>
            <div class="text-right p-3" style="width:99px;">
              {{ t('fee') }} (24h)
            </div>
            <div class="p-3" style="width:107px;" />
          </li>
          <li
            v-for="(lp, index) in lps"
            :key="index"
            class="flex flex-row items-center p-3 mb-4 cursor-pointer item"
            style="border-radius: 12px;"
            @click="$emit('selectLp', lp, volumesStack[lp.lpId] ? volumesStack[lp.lpId] : '-', tvlsStack[lp.lpId] ? tvlsStack[lp.lpId] : '-')"
          >
            <div class="text-white flex flex-row items-center py-3 text-sm oneline" style="width: 160px;font-weight: 500;">
              <div style="width:32px;height:32px;" class="relative mr-2">
                <TokenLogo :symbol="lp.tokenXSymbol" class="w-6 h-6" :chain-type="lp.tokenXChainType" />
                <TokenLogo :symbol="lp.tokenYSymbol" class="w-5 h-5 absolute bottom-0 right-0" :chain-type="lp.tokenYChainType" />
              </div>
              {{ lp.tokenXSymbol }}/{{ lp.tokenYSymbol }}
            </div>
            <div class="text-xs" style="width:200px;color: rgba(255, 255, 255, 0.85);">
              <div class="oneline">
                Min: <span style="color:#fff;font-weight:500;">{{ lp.lowPrice }}</span> {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}
              </div>
              <img src="@/images/arrow-both.png" class="w-3 h-3">
              <div class="oneline">
                Max: <span style="color:#fff;font-weight:500;">{{ lp.highPrice }}</span> {{ lp.tokenYSymbol }} per {{ lp.tokenXSymbol }}
              </div>
            </div>
            <div class="text-right text-white p-3 oneline" style="width:125px;font-weight: 500;">
              {{ tvlsStack[lp.lpId] ? `${tvlsStack[lp.lpId]}` : '-' }}
            </div>
            <div class="text-right text-white p-3 oneline" style="width:125px;font-weight: 500;">
              {{ volumesStack[lp.lpId] ? `${volumesStack[lp.lpId]}` : '-' }}
            </div>
            <div class="text-right text-white p-3 oneline" style="width:99px;font-weight: 500;">
              {{ rewardStack[lp.lpId] ? `${rewardStack[lp.lpId]}` : '-' }}
            </div>
            <div class="flex flex-row items-center justify-end flex-1 p-3 oneline" style="width:107px;">
              <Range :in-range="isSqrtInRange(lp.currentSqrtPrice, lp.lowSqrtPrice, lp.highSqrtPrice)" />
            </div>
          </li>
        </ul>
        <span v-else-if="account">{{ t('your_at_liq_appr') }}</span>
        <span v-else>{{ t('hold_nft_register') }}</span>
      </div>
      <div v-if="!account" class="flex flex-row items-center justify-center pb-4">
        <a
          class="text-sm py-1 border-box text-center"
          style="color: #79D483;border: 1px solid #183B21;border-radius: 8px;width:108px;"
          href="https://app.permaswap.network/#/nft"
          target="_blank">{{ t('collect_nft') }}</a>
        <div
          class="text-sm py-1 border-box text-center ml-12 cursor-pointer"
          style="color: #000;background: #79D483;border-radius: 8px;width:108px;"
          @click="showRegisterModal"
        >
          {{ t('sign_up') }}
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
  @keyframes breath {
    from {
      transform: scale(0.8);
    }
    to {
      transform: scale(1);
    }
  }
  .breath {
    animation-name: breath;
    animation-duration: 2s;
    animation-iteration-count: infinite;
  }
  .oneline {
    white-space: nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
  }
</style>
