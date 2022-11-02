<script lang="ts">
import { isProd } from '@/lib/swap'
import store from '@/store'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const downloadModalVisible = computed(() => store.state.downloadModalVisible)
    const hideDownloadModal = () => {
      store.commit('updateDownloadModalVisible', false)
    }

    return {
      t,
      isProd,
      downloadModalVisible,
      hideDownloadModal
    }
  }
})
</script>

<template>
  <div
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;z-index:20;"
    :class="downloadModalVisible ? 'block' : 'hidden'">
    <div
      style="
      padding: 32px 50px;
      position: fixed;
      width: 480px;
      height: 184px;
      left: 50%;
      top: 50%;
      background: #242D2A;
      transform: translate(-50%, -50%);
      box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);
      border-radius: 20px;">
      <div class="mb-8">
        {{ t('download_tip') }}
      </div>
      <div class="flex flex-row items-center justify-center">
        <div
          class="text-center text-sm border-box cursor-pointer mr-8"
          style="
          width:156px;
          height:40px;
          line-height: 40px;
          color: #79D483;
          border: 1px solid rgba(121, 212, 131, 0.2);
          border-radius: 8px;"
          @click="hideDownloadModal">
          {{ t('cancel') }}
        </div>
        <a
          class="text-center text-sm border-box cursor-pointer"
          style="
          width:156px;
          height:40px;
          line-height: 40px;
          border-radius: 8px;
          color: #000000;
          background: #79D483;"
          target="_blank"
          :href="isProd ? 'https://app-dev.permaswap.network/#/pool' : 'https://app-dev.permaswap.network/#/pool'">
          {{ t('download') }}
        </a>
      </div>
    </div>
  </div>
</template>
