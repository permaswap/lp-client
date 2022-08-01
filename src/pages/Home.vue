<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import AccountModal from '@/components/AccountModal.vue'
import RigisterModal from '@/components/RigisterModal.vue'
</script>

<template>
  <div class="bg-black text-white">
    <Header />
    <AccountModal />
    <RigisterModal />
    <div style="height:700px;" />
    <Footer />
  </div>
</template>
