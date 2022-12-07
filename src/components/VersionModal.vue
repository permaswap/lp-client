<script>
import { isProd } from '@/lib/swap'
import { isValidVersion } from '@/lib/util'
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  emits: ['closeModal'],
  setup (props) {
    const { t } = useI18n()
    const store = useStore()
    const version = computed(() => store.state.info.lpClientInfo['lp-javascript'].version)
    const validVersion = computed(() => isValidVersion(version.value))
    return {
      t,
      version,
      validVersion,
      isProd
    }
  }
})
</script>

<template>
  <div class="fixed" style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;">
    <div
      style="
    position: fixed;
    background: #363F3B;
    box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);
    border-radius: 20px;
    width:416px;
    top:160px;
    left:50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    padding:48px;"
      :style="validVersion ? 'height:308px;' : 'height:364px;'">
      <div class="flex flex-col items-center">
        <img src="@/images/per-version.png" style="width:100px;height:100px;" class="mb-4">
        <div class="text-white text-base mb-8">
          {{ validVersion ? t('no_update') : `Permaswap LP client ${version.toUpperCase()}` }}
        </div>
        <a
          v-if="!validVersion"
          target="_blank"
          :href="isProd ? 'https://app-dev.permaswap.network/#/pool' : 'https://app-dev.permaswap.network/#/pool'"
          class="text-sm text-black mb-4"
          style="
          box-sizing: border-box;
          background: #79D483;
          border-radius: 8px;
          display: flex;
          width: 208px;
          height: 40px;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 10px 48px;">
          {{ t('download_now') }}
        </a>
        <div
          v-if="!validVersion"
          class="text-sm cursor-pointer"
          style="
          box-sizing: border-box;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          padding: 10px 48px;
          width: 208px;
          height: 40px;
          color: #79D483;
          border: 1px solid rgba(121, 212, 131, 0.25);
          border-radius: 8px;"
          @click="$emit('closeModal')"
        >
          {{ t('download_later') }}
        </div>
        <div
          v-if="validVersion"
          class="text-sm text-black mb-4 cursor-pointer"
          style="
          box-sizing: border-box;
          background: #79D483;
          border-radius: 8px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          width: 208px;
          height: 40px;
          align-items: center;
          padding: 10px 48px;"
          @click="$emit('closeModal')">
          {{ t('cancel') }}
        </div>
        <img
          src="@/images/per-close.png"
          class="w-6 h-6 absolute cursor-pointer"
          style="top:24px;right:24px;"
          @click="$emit('closeModal')">
      </div>
    </div>
  </div>
</template>
