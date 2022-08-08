<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import AccountModal from '@/components/AccountModal.vue'
import RigisterModal from '@/components/RigisterModal.vue'
import { useStore } from '@/store'
import Overview from '@/components/Overview.vue'
import { computed } from '@vue/reactivity'
import AddPoolModal from '../components/AddPoolModal.vue'

const store = useStore()
const addPoolModalVisible = computed(() => store.state.addPoolModalVisible)
store.commit('updateAccount', '')
</script>

<template>
  <div class="bg-black text-white">
    <Header />
    <AccountModal />
    <RigisterModal />
    <div style="min-height:700px;">
      <Overview v-if="!addPoolModalVisible" />
      <AddPoolModal v-else />
    </div>
    <Footer />
  </div>
</template>
