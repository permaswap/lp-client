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
          >
            {{ t('simple_mining.liquidity') }}
          </div>
        </div>
        <img class="cursor-pointer" src="@/images/close.png" @click="hideMiningModal">
      </div>

      <div>
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            :label="t('simple_mining.liquidity_symbol', { symbol: poolTokenObj.xToken })"
            :value="poolTokenObj.xTokenTvl"
          />
          <mining-row
            class="mb-4"
            :label="t('simple_mining.liquidity_symbol', { symbol: poolTokenObj.yToken })"
            :value="poolTokenObj.yTokenTvl"
          />
          <mining-row
            class="mb-4"
            :label="t('simple_mining.lp_total_rewards')"
            :value="totalReward"
            :highlight="true"
          />
          <mining-row
            :label="t('simple_mining.duration')"
            :value="liquidityTimeString"
          />
        </div>
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            :label="t('simple_mining.lp_my_est_rewards')"
            :value="myHALOReward"
          />
          <ul class="list-disc text-xs mt-3 pt-4 pl-3" style="border-top: 1px solid rgba(255, 255, 255, 0.08);color:rgba(255, 255, 255, 0.45);">
            <li>{{ t('simple_mining.lp_rules_tips1') }}</li>
            <li>{{ t('simple_mining.lp_rules_tips2') }}</li>
          </ul>
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
import { checkParentsHas, toBN } from '@/lib/util'
import Everpay from 'everpay'
import { getLiquidityMingInfo, getNodeHaloInfo, getPoolIdVolumeData, isProd } from '@/lib/swap'
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
    const liquidityMingId = isProd ? '0xed81bf40f5cbaf1acc8751fb4c06f6751bc225d1af94fd4b8350ead6ca28189e' : '0x41a886484bb899af5dd5d038e690a31068493d4ad4e20f5e3e9a65a509d21efb'
    const store = useStore()
    const miningModalVisible = computed(() => store.state.miningModalVisible)
    const tab = ref('liquidity')
    const { t, locale } = useI18n()
    const hideMiningModal = () => store.commit('updateMiningModalVisible', false)
    const account = computed(() => store.state.account)

    const isMiningModal = checkParentsHas('mining-modal')
    const isMiningModalTrigger = checkParentsHas('mining-modal-trigger')
    const liquidityTimeString = ref('')

    onMounted(() => {
      document.addEventListener('click', (e) => {
        if (!isMiningModal(e.target as any) && !isMiningModalTrigger(e.target as any)) {
          hideMiningModal()
        }
      })
    })

    const everpay = new Everpay({ debug: !isProd })
    const liquidityMingInfo = ref<any>(null)
    const poolTokenObj = ref<any>({})
    const totalReward = ref('')
    const liquidityMingBaseToken = {
      symbol: 'HALO',
      decimals: 18
    }

    const myHALOReward = computed(() => {
      if (liquidityMingInfo.value) {
        try {
          if (!account.value) {
            return '-'
          }
          const localState = JSON.parse(liquidityMingInfo.value.executor.localState)
          console.log(localState.mined[account.value])
          const reward = localState.mined[account.value]
          if (reward) {
            return `${toBN(fromDecimalToUnit(reward, liquidityMingBaseToken.decimals)).toFixed(2)} ${liquidityMingBaseToken.symbol}`
          } else {
            return '0 HALO'
          }
        } catch (e) {
          return '-'
        }
      }
      return '-'
    })

    const initLiquidityMingInfoInfo = async () => {
      const everpayInfo = await everpay.info()
      const data = await getLiquidityMingInfo(liquidityMingId)
      console.log(data)
      liquidityMingInfo.value = data
      let initData: any = null
      try {
        initData = JSON.parse(data.initData)
      } catch {
        initData = null
      }
      if (initData) {
        // 获取 X Y 锁仓量
        const haloNodeInfo = await getNodeHaloInfo()
        const routerState = haloNodeInfo.routerState[initData.router]
        if (routerState.pools && Object.keys(routerState.pools).length) {
          if (Object.keys(routerState.pools).includes(initData.pool)) {
            const pool = routerState.pools[initData.pool]
            const data1 = await getPoolIdVolumeData(initData.pool)
            const xToken = getTokenByTag(pool.tokenXTag, everpayInfo.tokenList)
            const yToken = getTokenByTag(pool.tokenYTag, everpayInfo.tokenList)
            const xTokenTvl = toBN(data1.tvl.tokenXTVL).toFixed(2)
            const yTokenTvl = toBN(data1.tvl.tokenYTVL).toFixed(2)
            if (xToken && yToken) {
              poolTokenObj.value.xToken = xToken.symbol
              poolTokenObj.value.yToken = yToken.symbol
              poolTokenObj.value.xTokenTvl = xTokenTvl
              poolTokenObj.value.yTokenTvl = yTokenTvl
            }
          }
        }
        // 时间
        liquidityTimeString.value = getTimeString(initData.start, initData.end)
        // 所有收益定死 HALO
        if (liquidityMingBaseToken) {
          totalReward.value = `${toBN(fromDecimalToUnit(initData.totalSupply, liquidityMingBaseToken.decimals)).toFixed(2)} ${liquidityMingBaseToken.symbol}`
          console.log(totalReward.value)
        }
      }
    }

    initLiquidityMingInfoInfo()
    watch([account, miningModalVisible], () => {
      if (miningModalVisible.value) {
        initLiquidityMingInfoInfo()
      }
    })

    return {
      account,
      miningModalVisible,
      hideMiningModal,
      tab,
      t,
      locale,
      liquidityTimeString,
      totalReward,
      myHALOReward,
      poolTokenObj
    }
  }
})
</script>
