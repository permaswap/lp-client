<script setup lang="ts">
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import AccountModal from '@/components/AccountModal.vue'
import RigisterModal from '@/components/RigisterModal.vue'
import { useStore } from '@/store'
import Overview from '@/components/Overview.vue'
import { computed } from '@vue/reactivity'
import AddPoolModal from '../components/AddPoolModal.vue'
import ClosePoolModal from '../components/closePoolModal.vue'

const store = useStore()
const addPoolModalVisible = computed(() => store.state.addPoolModalVisible)
const selectedLp = ref(null)
const selectLp = (lp: any) => {
  selectedLp.value = lp
}
store.commit('updateAccount', '')
store.commit('clearLps')
</script>

<template>
  <div class="text-white" style="background: #000a06;">
    <Header :select-overview="!addPoolModalVisible && !selectedLp" />
    <AccountModal />
    <RigisterModal />
    <div style="min-height:700px;" class="mt-20">
      <ClosePoolModal v-if="selectedLp" :lp="selectedLp" @back="selectedLp = null" />
      <Overview v-else-if="!addPoolModalVisible" @selectLp="selectLp" />
      <AddPoolModal v-else />
    </div>
    <Footer />
  </div>
</template>
