<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NoticeTip from './NoticeTip.vue'
import Top5Modal from './Top5Modal.vue'

export default defineComponent({
  components: { NoticeTip, Top5Modal },
  setup () {
    const tip0Visible = ref(false)
    const tip1Visible = ref(false)
    const tip2Visible = ref(false)
    const tip3Visible = ref(false)
    const tip4Visible = ref(false)
    const tip5Visible = ref(false)
    const top5Visible = ref(false)
    const { t } = useI18n()

    return {
      t,
      tip0Visible,
      tip1Visible,
      tip2Visible,
      tip3Visible,
      tip4Visible,
      tip5Visible,
      top5Visible
    }
  }
})
</script>

<template>
  <div
    style="width:864px;background: #161E1B;border-radius: 24px;"
    class="mx-auto p-8 mb-8"
  >
    <div
      class="flex flex-row items-start justify-between pb-4 mb-4"
      style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
    >
      <div
      >
        <div
          class="cursor-pointer relative"
          @mouseover="tip0Visible = true"
          @mouseleave="tip0Visible = false">
          {{ t('trade_overview.trading') }}
          <NoticeTip v-if="tip0Visible">
            {{ t('trade_overview.trading_tip') }}
          </NoticeTip>
        </div>
        <a
          target="_blank"
          href="https://baidu.com"
          class="text-xs"
          style="color: #79D483;"
        >
          {{ t('trade_overview.tutorial') }}
        </a>
      </div>
      <div>
        <div class="text-sm">
          2022.12.12  ~ 2023.01.12
        </div>
        <div class="text-xs text-right" style="color: rgba(255, 255, 255, 0.65);">
          {{ t('trade_overview.countdown') }} 7d 5h 25m 45s
        </div>
      </div>
    </div>
    <div class="flex flex-row items-center">
      <div class="relative w-1/5">
        <div
          class="mb-3 text-sm cursor-pointer relative"
          style="color: rgba(255, 255, 255, 0.65);text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);"
          @mouseover="tip1Visible = true"
          @mouseleave="tip1Visible = false"
        >
          {{ t('trade_overview.total_rewards') }}
          <NoticeTip v-if="tip1Visible">
            {{ t('trade_overview.total_rewards_tip') }}
          </NoticeTip>
        </div>
        <div style="color: #79D483;text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);font-size: 20px;">
          $1,000,000
        </div>
      </div>
      <div class="relative w-1/5">
        <div
          class="mb-3 text-sm cursor-pointer relative"
          style="color: rgba(255, 255, 255, 0.65);text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);"
          @mouseover="tip2Visible = true"
          @mouseleave="tip2Visible = false"
        >
          {{ t('trade_overview.total_volume') }}
          <NoticeTip v-if="tip2Visible">
            {{ t('trade_overview.total_volume_tip') }}
          </NoticeTip>
        </div>
        <div style="text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);font-size: 20px;">
          $1,000,000
        </div>
      </div>
      <div class="relative w-1/5">
        <div
          class="mb-3 text-sm cursor-pointer relative"
          style="color: rgba(255, 255, 255, 0.65);text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);"
          @mouseover="tip3Visible = true"
          @mouseleave="tip3Visible = false"
        >
          {{ t('trade_overview.my_volume') }}
          <NoticeTip v-if="tip3Visible">
            {{ t('trade_overview.my_volume_tip') }}
          </NoticeTip>
        </div>
        <div style="text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);font-size: 20px;">
          $1,000
        </div>
      </div>
      <div class="relative w-1/5">
        <div
          class="mb-3 text-sm cursor-pointer relative"
          style="color: rgba(255, 255, 255, 0.65);text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);"
          @mouseover="tip4Visible = true"
          @mouseleave="tip4Visible = false"
        >
          {{ t('trade_overview.my_volume_share') }}
          <NoticeTip v-if="tip4Visible">
            {{ t('trade_overview.my_volume_share_tip') }}
          </NoticeTip>
        </div>
        <div style="text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);font-size: 20px;">
          11.82%
        </div>
      </div>
      <div class="relative w-1/5">
        <div
          class="mb-3 text-sm cursor-pointer relative flex flex-row items-center"
          style="color: rgba(255, 255, 255, 0.65);text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);"
          @mouseover="tip5Visible = true"
          @mouseleave="tip5Visible = false"
        >
          <NoticeTip v-if="tip5Visible">
            {{ t('trade_overview.my_est_rewards_tip') }}
          </NoticeTip>
          <div>{{ t('trade_overview.my_est_rewards') }}</div>
          <img src="@/images/award.png" class="w-4 h-4" @click="top5Visible = true">
        </div>
        <div style="text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);font-size: 20px;">
          10AR
        </div>
        <Top5Modal v-if="top5Visible" :items="[]" @close="top5Visible = false" />
      </div>
    </div>
  </div>
</template>
