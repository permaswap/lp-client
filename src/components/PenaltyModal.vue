<script lang="ts">
import { getPenalty } from '@/lib/swap'
import store from '@/store'
import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ethers } from 'ethers'

const toDouble = (n: number): string => {
  return n < 10 ? `0${n}` : `${n}`
}
const getDateTime = (timestamp: number): string => {
  const oDate = new Date(timestamp * 1000)
  return `${oDate.getFullYear()}.${toDouble(oDate.getMonth() + 1)}.${toDouble(oDate.getDate())} ${toDouble(oDate.getHours())}:${toDouble(oDate.getMinutes())}:${toDouble(oDate.getSeconds())}`
}

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const account = computed(() => store.state.account)
    const penaltyModalVisible = computed(() => store.state.penaltyModalVisible)
    const dateTime = ref('----.--.-- --:--:--')
    const hidePenaltyModal = () => {
      store.commit('updatePenaltyModalVisible', false)
    }

    watch(penaltyModalVisible, async () => {
      if (penaltyModalVisible.value) {
        const penaltyResult = await getPenalty()
        const acc = account.value.startsWith('0x') ? ethers.utils.getAddress(account.value) : account.value
        dateTime.value = getDateTime(penaltyResult.blackList[acc] + penaltyResult.expirationDuration)
      }
    })

    return {
      t,
      dateTime,
      penaltyModalVisible,
      hidePenaltyModal
    }
  }
})
</script>

<template>
  <div
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;z-index:20;"
    :class="penaltyModalVisible ? 'block' : 'hidden'">
    <div
      style="
      padding: 24px;
      position: fixed;
      width: 480px;
      height: 323px;
      left: 50%;
      top: 50%;
      background: #242D2A;
      transform: translate(-50%, -50%);
      box-shadow: 0px 3px 6px -4px rgba(0, 10, 6, 0.12), 0px 6px 16px rgba(0, 10, 6, 0.08), 0px 9px 28px 8px rgba(0, 10, 6, 0.05);
      border-radius: 20px;">
      <div class="flex flex-row items-center justify-between pb-4 mb-6" style="border-bottom:1px solid rgba(255, 255, 255, 0.08);">
        <div class="flex flex-row items-center">
          <span style="font-size: 20px;" class="mr-1">{{ t('warning') }}</span>
          <img src="@/images/warning.png" class="w-4 h-4">
        </div>
        <img src="@/images/cancel2.png" class="w-5 h-5 cursor-pointer" @click="hidePenaltyModal">
      </div>
      <div class="text-sm" style="color: rgba(255, 255, 255, 0.85);">
        <div>{{ t('penalty_rule_1') }}</div>
        <div>
          {{ t('penalty_rule_2') }}
          <span class="text-base text-white"> {{ dateTime }} </span>
          {{ t('penalty_rule_3') }}
        </div>
      </div>

      <div
        class="text-center text-sm text-black absolute left-6 bottom-6 cursor-pointer"
        style="width: 432px;height: 40px;line-height: 40px; background: #79D483;border-radius: 8px;"
        @click="hidePenaltyModal"
      >
        {{ t('confirm') }}
      </div>
    </div>
  </div>
</template>
