<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import Header from '@/components/Header.vue'
// import Footer from '@/components/Footer.vue'
import AccountModal from '@/components/AccountModal.vue'
import RigisterModal from '@/components/RigisterModal.vue'
import { useStore } from '@/store'
import Overview from '@/components/Overview.vue'
import { computed } from '@vue/reactivity'
import AddPoolModal from '../components/AddPoolModal.vue'
import ClosePoolModal from '../components/closePoolModal.vue'
import NoticeBoard from '../components/NoticeBoard.vue'
import { getNfts } from '@/lib/swap'
import DownloadModal from '@/components/DownloadModal.vue'
import SystemCloseModal from '@/components/SystemCloseModal.vue'

const store = useStore()
const account = computed(() => store.state.account)
const addPoolModalVisible = computed(() => store.state.addPoolModalVisible)
const selectedLp = ref(null)
const selectedVolume = ref('-')
const selectedTvl = ref('-')
const noticeBoardVisible = ref(false)
const selectLp = (lp: any, volume: string, tvl: string) => {
  selectedLp.value = lp
  selectedVolume.value = volume
  selectedTvl.value = tvl
}
store.commit('updateAccount', '')
store.commit('clearLps')
store.commit('updateManualConnect', false)
store.commit('updateSuccessConnect', false)
store.commit('updateAddPoolModalVisible', false)
store.commit('updateAccountModalVisible', false)
store.commit('updateRegisterModalVisible', false)

onMounted(async () => {
  const nftsResult = await getNfts()
  store.commit('updateHolderToNFTs', nftsResult.holderToNFTs)
  store.commit('updateWhitelist', nftsResult.whitelist)
  store.dispatch('updateInfoAsync')
})

watch(account, () => {
  if (account.value === '') {
    selectedLp.value = null
    store.commit('updateAddPoolModalVisible', false)
  }
})
</script>

<template>
  <div class="text-white" style="background: #000a06;">
    <Header :select-overview="!addPoolModalVisible && !selectedLp" />
    <NoticeBoard v-if="noticeBoardVisible" :duration="15" @close="noticeBoardVisible = false">
      The connection address is the same as the LP node address, transaction is prohibited, please switch account！
    </NoticeBoard>
    <AccountModal />
    <RigisterModal />
    <div style="min-height:700px;">
      <ClosePoolModal
        v-if="selectedLp"
        :lp="selectedLp"
        :volume="selectedVolume"
        :tvl="selectedTvl"
        @back="selectedLp = null" />
      <Overview v-else-if="!addPoolModalVisible" @selectLp="selectLp" />
      <AddPoolModal v-else />
      <DownloadModal />
    </div>
    <SystemCloseModal />
    <!-- <Footer /> -->
  </div>
</template>
