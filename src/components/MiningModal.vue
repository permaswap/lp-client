<template>
  <div
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:76px;left:0;z-index:20;"
    :class="miningModalVisible ? 'block' : 'hidden'">
    <div
      style="background: #242D2A;border-radius: 12px;right:64px;top: 0;width:440px;"
      class="absolute p-6 mining-modal">
      <div
        class="flex flex-row items-center justify-between pb-4 mb-4"
        style="font-size: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);"
      >
        <div class="flex flex-row items-center">
          <div
            class="relative cursor-pointer mr-3"
            :style="tab === 'liquidity' ? 'color: #79D483' : ''"
            @click="tab = 'liquidity'"
          >
            {{ t('ans_mining.liquidity') }}
            <div
              v-if="tab === 'liquidity'"
              class="absolute w-full left-0"
              style="height:2px;background: #79D483; bottom:-17px"
            />
          </div>
          <div
            class="relative cursor-pointer"
            :style="tab === 'trading' ? 'color: #79D483' : ''"
            @click="tab = 'trading'"
          >
            {{ t('ans_mining.trading') }}
            <div
              v-if="tab === 'trading'"
              class="absolute w-full left-0"
              style="height:2px;background: #79D483; bottom:-17px"
            />
          </div>
        </div>
        <img class="cursor-pointer" src="@/images/close.png" @click="hideMiningModal">
      </div>

      <div :class="tab === 'liquidity' ? 'block' : 'hidden'">
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            :label="t('ans_mining.tvl')"
            :value="tvl"
            :info-message="t('ans_mining.tvl_tip')"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.join_tvl')"
            :value="joinTvl"
            :info-message="t('ans_mining.join_tvl_tip')"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.ans_total_reward')"
            :value="liquidityRewardTokenString"
            :highlight="true"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.apr')"
            :value="liquidityAPR"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.period')"
            :value="t('ans_mining.1month')"
          />
          <mining-row
            :label="t('ans_mining.time')"
            :value="liquidityTimeString"
          />
        </div>
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            :label="t('ans_mining.my_apr')"
            :value="liquidityMyAPR"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.sent_reward')"
            :value="liquidityMyReward"
            :info-message="t('ans_mining.sent_reward_tip')"
          />
          <mining-row
            :label="t('ans_mining.single_day_est_reward')"
            :value="liquidityMyEstReward"
            :info-message="t('ans_mining.single_day_est_reward_tip')"
          />
        </div>
        <ul
          class="pt-4 text-xs list-disc pl-4"
          style="color: rgba(255, 255, 255, 0.45);border-top: 1px solid rgba(255, 255, 255, 0.08);line-height: 20px;"
        >
          <li>{{ t('ans_mining.notice_tip_1') }}</li>
          <li>{{ t('ans_mining.notice_tip_2') }}</li>
          <li style="color: #D3B078;">
            <a
              :href="locale === 'zh' ? 'https://permadao.notion.site/ANS-976f7a7c70444fa5a4f5e728917b0385?pvs=4' : 'https://permadao.notion.site/ANS-Campaign-08d2bb03d26e45f3b3bb73d54ea72069?pvs=4'"
              target="_blank"
              style="color: #D3B078;"
            >
              {{ t('ans_mining.more_rule') }}
            </a>
          </li>
        </ul>
      </div>
      <div :class="tab === 'trading' ? 'block' : 'hidden'">
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            :label="t('ans_mining.total_rewards')"
            :value="tradingRewardTokenString"
            :highlight="true"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.ans_total_volume')"
            :value="tradingTotalVolume"
            :info-message="t('ans_mining.ans_total_volume_tip')"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.duration')"
            :value="t('ans_mining.2weeks')"
          />
          <mining-row
            :label="t('ans_mining.time')"
            :value="tradingTimeString"
          />
        </div>
        <div
          class="py-3 px-4"
          style="background: rgba(22, 30, 27, 0.45);border: 1px solid rgba(164, 224, 169, 0.25);border-radius: 12px;"
        >
          💰{{ t('ans_mining.trading_tip_1') }}
          <a href="https://app.permaswap.network/USDC-ANS" target="_blank" style="color: #79D483;">
            {{ t('ans_mining.trading_tip_2') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import MiningRow from './MiningRow.vue'
import { checkParentsHas, formatMoney, toBN } from '@/lib/util'
import Everpay from 'everpay'
import { ethers } from 'ethers'
import { getMiningInfo, isProd } from '@/lib/swap'
import { fromDecimalToUnit, getTokenByTag } from 'everpay/esm/utils/util'

const toDouble = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`
}
const getTimeDate = (timestamp: number): string => {
  const oDate = new Date(timestamp * 1000)
  return `${oDate.getFullYear()}.${toDouble(oDate.getMonth() + 1)}.${toDouble(oDate.getDate())}`
}
const getTimeString = (start: number, end: number): string => {
  return `${getTimeDate(start)} ~ ${getTimeDate(end)}`
}

export default defineComponent({
  components: { MiningRow },
  setup () {
    const store = useStore()
    const miningModalVisible = computed(() => store.state.miningModalVisible)
    const tab = ref('liquidity')
    const { t, locale } = useI18n()
    const hideMiningModal = () => store.commit('updateMiningModalVisible', false)
    const account = computed(() => store.state.account)

    const isMiningModal = checkParentsHas('mining-modal')
    const isMiningModalTrigger = checkParentsHas('mining-modal-trigger')
    const everpay = new Everpay({ debug: !isProd })
    const tvl = ref('')
    const joinTvl = ref('')
    const liquidityRewardTokenString = ref('')
    const liquidityAPR = ref('0.0%')
    const liquidityMyAPR = ref('0.0%')
    const liquidityMyReward = ref('')
    const liquidityMyEstReward = ref('')
    const liquidityTimeString = ref('')
    const tradingRewardTokenString = ref('')
    const tradingTotalVolume = ref('')
    const tradingTimeString = ref('')

    onMounted(() => {
      document.addEventListener('click', (e) => {
        if (!isMiningModal(e.target as any) && !isMiningModalTrigger(e.target as any)) {
          hideMiningModal()
        }
      })
    })

    const updateMiningData = async () => {
      const everpayInfo = await everpay.info()
      const miningInfo = await getMiningInfo()
      console.log(everpayInfo, miningInfo)
      const liquidityRewardToken = getTokenByTag(miningInfo.liquidity_mining[1].rewardToken, everpayInfo.tokenList)
      const liquidityRewardTokenDecimal = miningInfo.liquidity_mining[1].rewardTokenDecimals
      // ------------------liquidity------------------
      // TVL
      tvl.value = `$${formatMoney(miningInfo.liquidity_mining[1].currentTVL, 2)}`
      // 活动 TVL
      joinTvl.value = `$${formatMoney(miningInfo.liquidity_mining[1].currentEffectiveTVL, 2)}`
      // 总奖励
      liquidityRewardTokenString.value = `${fromDecimalToUnit(miningInfo.liquidity_mining[1].rewardAmount, liquidityRewardTokenDecimal)} ${liquidityRewardToken?.symbol.toUpperCase()}`
      // APR
      liquidityAPR.value = `${toBN(miningInfo.liquidity_mining[1].currentAPY as any).times(100).toString()}%`

      const addrKey = account.value && account.value.startsWith('0x') ? ethers.utils.getAddress(account.value) : account.value
      const lpAPY = miningInfo.liquidity_mining[1].lpAPY ? miningInfo.liquidity_mining[1].lpAPY : {}
      // My APR
      liquidityMyAPR.value = lpAPY[addrKey] ? `${toBN(lpAPY[addrKey] as any).times(100).toString()}%` : '0.0%'
      const userReward = miningInfo.liquidity_mining[1].rewards ? miningInfo.liquidity_mining[1].rewards : {}
      // 已发奖励
      liquidityMyReward.value = userReward[addrKey] ? `${fromDecimalToUnit(userReward[addrKey], liquidityRewardTokenDecimal)} ${liquidityRewardToken?.symbol.toUpperCase()}` : `0 ${liquidityRewardToken?.symbol.toUpperCase()}`
      const estReward = miningInfo.liquidity_mining[1].currentRewards ? miningInfo.liquidity_mining[1].currentRewards : {}
      // 当日预估奖励
      liquidityMyEstReward.value = estReward[addrKey] ? `${fromDecimalToUnit(estReward[addrKey].reward, liquidityRewardTokenDecimal)} ${liquidityRewardToken?.symbol.toUpperCase()}` : `0 ${liquidityRewardToken?.symbol.toUpperCase()}`
      // 时间
      liquidityTimeString.value = getTimeString(miningInfo.liquidity_mining[1].start, miningInfo.liquidity_mining[1].end)
      // ------------------trading------------------
      const tradingRewardToken = getTokenByTag(miningInfo.swap_mining[1].rewardToken, everpayInfo.tokenList)
      const tradingRewardTokenDecimal = miningInfo.swap_mining[1].rewardTokenDecimals
      // 总奖励
      tradingRewardTokenString.value = `${fromDecimalToUnit(miningInfo.swap_mining[1].rewardAmount, tradingRewardTokenDecimal)} ${tradingRewardToken?.symbol.toUpperCase()}`
      const tradingBaseToken = getTokenByTag(miningInfo.swap_mining[1].baseToken, everpayInfo.tokenList)
      const userVolumeArr = Object.values(miningInfo.swap_mining[1].userVolume ? miningInfo.swap_mining[1].userVolume : {}) as any[]
      const tradingVolumeDecimalAmount = userVolumeArr.length
        ? userVolumeArr.reduce((memo: any, current: any) => {
          return toBN(memo).plus(toBN(current)).toString()
        }, '0') as any
        : '0' as any
      const tradingVolumeAmount = fromDecimalToUnit(tradingVolumeDecimalAmount, miningInfo.swap_mining[1].baseTokenDecimal)
      // 总交易量
      tradingTotalVolume.value = `${tradingVolumeAmount} ${tradingBaseToken?.symbol.toUpperCase()}`
      // 时间
      tradingTimeString.value = getTimeString(miningInfo.swap_mining[1].start, miningInfo.swap_mining[1].end)
    }

    updateMiningData()
    watch([account, miningModalVisible], () => {
      if (miningModalVisible.value) {
        updateMiningData()
      }
    })

    return {
      account,
      miningModalVisible,
      hideMiningModal,
      tab,
      t,
      locale,
      tvl,
      joinTvl,
      liquidityRewardTokenString,
      liquidityAPR,
      liquidityMyAPR,
      liquidityMyReward,
      liquidityMyEstReward,
      liquidityTimeString,
      tradingRewardTokenString,
      tradingTotalVolume,
      tradingTimeString
    }
  }
})
</script>
