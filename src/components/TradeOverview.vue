<script lang="ts">
import { getTradingInfo, getTradingStats } from '@/lib/trading'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import NoticeTip from './NoticeTip.vue'
import Top5Modal from './Top5Modal.vue'
import Everpay from 'everpay'
import { getTokenByTag } from 'everpay/esm/utils/util'
import { isProd } from '@/lib/swap'
import { toBN } from '@/lib/util'

const toDouble = (n: number): string => {
  if (n < 10) {
    return `0${n}`
  }
  return `${n}`
}

const getTimeStr = (timestamp: number): string => {
  const oDate = new Date()
  oDate.setTime(timestamp * 1000)
  return `${oDate.getFullYear()}.${toDouble(oDate.getMonth() + 1)}.${toDouble(oDate.getDate())}`
}

const getCountdownStr = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000)
  const rest = timestamp - now
  if (rest <= 0) {
    return '0d 0h 0m 0s'
  }
  const days = Math.floor(rest / 86400)
  const hours = Math.floor((rest - days * 86400) / 3600)
  const minutes = Math.floor((rest - days * 86400 - hours * 3600) / 60)
  const seconds = Math.floor(rest - days * 86400 - hours * 3600 - minutes * 60)
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

const getTop5Item = (oriItem: any, symbol: string) => {
  const { accid, reward } = oriItem
  return {
    accid: `${accid.slice(0, 4)}...${accid.slice(-2)}`,
    reward: `${toBN(reward).toFixed(2)}${symbol}`
  }
}

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
    const store = useStore()
    const account = computed(() => store.state.account)
    const { t } = useI18n()
    const totalReward = ref('')
    const totalVolume = ref('')
    const myVolume = ref('')
    const myPercent = ref('')
    const myAstReward = ref('')
    const eventTimeStr = ref('2022.12.12 ~ 2023.01.12')
    const countdownStr = ref('0d 0h 0m 0s')
    const rewardSymbol = ref('')
    const top5Items = ref([])
    let countdownTimer = null as any
    let intervalUpdateTimer = null as any
    let everpayInfo = null as any

    const fetchData = async () => {
      clearTimeout(intervalUpdateTimer)
      const promises = [getTradingInfo()]
      if (store.state.account) {
        promises.push(getTradingStats(store.state.account))
      } else {
        promises.push(Promise.resolve(null))
      }

      const [info, stats] = await Promise.all(promises)
      eventTimeStr.value = `${getTimeStr(info.startAt)} ~ ${getTimeStr(info.endAt)}`
      const rewardToken = getTokenByTag(info.lpRewardToken, everpayInfo.tokenList)
      rewardSymbol.value = rewardToken?.symbol as string
      totalReward.value = info.lpRewardAmount
      totalVolume.value = toBN(info.totalLpVolume).toFixed(2)
      top5Items.value = info.lpTop5.map((item: any) => {
        return getTop5Item(item, rewardSymbol.value)
      })

      if (stats == null) {
        myVolume.value = '—'
        myPercent.value = '—'
        myAstReward.value = '—'
      } else {
        if (stats.volume < 0.01) {
          myVolume.value = '<$0.01'
        } else {
          myVolume.value = `$${toBN(stats.volume).toFixed(2)}`
        }
        if (stats.percent < 0.01) {
          myPercent.value = '<0.01%'
        } else {
          myPercent.value = `${toBN(stats.percent).toFixed(2)}%`
        }
        if (stats.reward < 0.01) {
          myAstReward.value = `<0.01${rewardSymbol.value}`
        } else {
          myAstReward.value = `${toBN(stats.reward).toFixed(2)}${rewardSymbol.value}`
        }
      }

      const timer = () => {
        countdownStr.value = getCountdownStr(info.endAt)
        clearTimeout(countdownTimer)
        if (countdownStr.value !== '0d 0h 0m 0s') {
          countdownTimer = setTimeout(timer, 1000)
        }
      }
      timer()
      intervalUpdateTimer = setTimeout(fetchData, 60000)
    }

    watch(account, fetchData)

    onMounted(async () => {
      const everpay = new Everpay({ debug: !isProd })
      everpayInfo = await everpay.info()
      fetchData()
    })

    return {
      t,
      tip0Visible,
      tip1Visible,
      tip2Visible,
      tip3Visible,
      tip4Visible,
      tip5Visible,
      top5Visible,
      totalReward,
      totalVolume,
      myVolume,
      myPercent,
      myAstReward,
      eventTimeStr,
      countdownStr,
      rewardSymbol,
      top5Items
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
      class="pb-4 mb-4"
      style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
    >
      <div class="flex flex-row items-start justify-between">
        <div
          class="cursor-pointer relative"
          @mouseover="tip0Visible = true"
          @mouseleave="tip0Visible = false">
          {{ t('trade_overview.trading') }}
          <NoticeTip v-if="tip0Visible">
            {{ t('trade_overview.trading_tip') }}
          </NoticeTip>
        </div>
        <div class="text-sm">
          {{ eventTimeStr }}
        </div>
      </div>
      <div class="flex flex-row items-start justify-between">
        <a
          target="_blank"
          href="https://medium.com/@Permaswap/limitless-stress-test-6f2bd738aa74"
          class="text-xs"
          style="color: #79D483;"
        >
          {{ t('trade_overview.tutorial') }}
        </a>
        <div class="text-xs text-right" style="color: rgba(255, 255, 255, 0.65);">
          {{ t('trade_overview.countdown') }} {{ countdownStr }}
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
          {{ totalReward ? `${totalReward}${rewardSymbol}` : '—' }}
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
          {{ totalVolume ? `$${totalVolume}` : '—' }}
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
          {{ myVolume }}
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
          {{ myPercent }}
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
          {{ myAstReward }}
        </div>
        <Top5Modal v-if="top5Visible" :items="top5Items" @close="top5Visible = false" />
      </div>
    </div>
  </div>
</template>
