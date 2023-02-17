<template>
  <div style="background: rgba(24, 59, 33, 0.2);height: 296px;" class="py-10 mb-16">
    <div style="width:864px;" class="mx-auto flex flex-row items-center justify-between">
      <div class="py-6 flex-1 mr-8">
        <div class="mb-12">
          <div style="font-size: 20px;color: #fff;" class="mb-1">
            {{ t('dashboard.dashboard') }}
          </div>
          <div class="text-sm" style="color: rgba(255, 255, 255, 0.65);">
            2022.12.12 ~ {{ date }}
          </div>
        </div>
        <div class="flex flex-row items-center justify-between">
          <div style="width:200px;">
            <div
              class="text-sm mb-2 relative cursor-pointer"
              style="color: rgba(255, 255, 255, 0.65);"
              @mouseover="tip1Visible = true"
              @mouseleave="tip1Visible = false"
            >
              {{ t('dashboard.total_volume') }}
              <NoticeTip v-if="tip1Visible">
                {{ t('dashboard.total_volume_tip') }}
              </NoticeTip>
            </div>
            <div
              class="relative cursor-pointer"
              style="font-size: 28px;font-weight: 500;color: #79D483;"
              @mouseover="content1Visible = true"
              @mouseleave="content1Visible = false"
            >
              <div class="oneline">
                {{ totalVolume }}
              </div>
              <NoticeTip v-if="content1Visible && totalVolume !== '-'" :bottom="48">
                {{ totalVolume }}
              </NoticeTip>
            </div>
          </div>
          <div style="width:200px;">
            <div
              class="text-sm mb-2 relative cursor-pointer"
              style="color: rgba(255, 255, 255, 0.65);"
              @mouseover="tip2Visible = true"
              @mouseleave="tip2Visible = false"
            >
              {{ t('dashboard.my_volume') }}
              <NoticeTip v-if="tip2Visible">
                {{ t('dashboard.my_volume_tip') }}
              </NoticeTip>
            </div>
            <div
              class="relative cursor-pointer"
              style="font-size: 28px;font-weight: 500;color: #FFFFFF;"
              @mouseover="content2Visible = true"
              @mouseleave="content2Visible = false"
            >
              <div class="oneline">
                {{ myVolume }}
              </div>
              <NoticeTip v-if="content2Visible && myVolume !== '-'" :bottom="48">
                {{ myVolume }}
              </NoticeTip>
            </div>
          </div>
          <div style="width:200px;">
            <div
              class="text-sm mb-2 relative cursor-pointer"
              style="color: rgba(255, 255, 255, 0.65);"
              @mouseover="tip3Visible = true"
              @mouseleave="tip3Visible = false"
            >
              {{ t('dashboard.my_earnings') }}
              <NoticeTip v-if="tip3Visible">
                <div>{{ t('dashboard.my_earnings_tip_1') }}</div>
                <div>{{ t('dashboard.my_earnings_tip_2') }}</div>
              </NoticeTip>
            </div>
            <div
              class="relative cursor-pointer"
              style="font-size: 28px;font-weight: 500;color: #FFFFFF;"
              @mouseover="content3Visible = true"
              @mouseleave="content3Visible = false"
            >
              <div class="oneline">
                {{ myEarnings }}
              </div>
              <NoticeTip v-if="content3Visible && myEarnings !== '-'" :bottom="48">
                {{ myEarnings }}
              </NoticeTip>
            </div>
          </div>
        </div>
      </div>
      <img src="@/images/dashboard.png" style="width:216px;height:216px;">
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useStore } from '@/store'
import { useI18n } from 'vue-i18n'
import NoticeTip from './NoticeTip.vue'
import { getAggregate } from '@/lib/swap'
import { formatMoney, toBN } from '@/lib/util'

const toDouble = (n: number): string => {
  return n < 10 ? `0${n}` : `${n}`
}
const getCurrentDate = () => {
  const oDate = new Date()
  return `${oDate.getFullYear()}.${toDouble(oDate.getMonth() + 1)}.${toDouble(oDate.getDate())}`
}

export default defineComponent({
  components: {
    NoticeTip
  },
  setup () {
    const date = getCurrentDate()
    const { t } = useI18n()
    const store = useStore()
    const account = computed(() => store.state.account)
    const tip1Visible = ref(false)
    const tip2Visible = ref(false)
    const tip3Visible = ref(false)
    const content1Visible = ref(false)
    const content2Visible = ref(false)
    const content3Visible = ref(false)
    const totalVolume = ref('-')
    const myVolume = ref('-')
    const myEarnings = ref('-')

    const getAndSetAggregate = async () => {
      const result = await getAggregate(account.value ? account.value : '')

      if (result.lpVolume >= 1) {
        totalVolume.value = `$${formatMoney(toBN(result.lpVolume).toFixed(0), 0)}`
      } else {
        totalVolume.value = '<$1'
      }

      if (account.value) {
        if (result.user.lpVolume >= 1 || result.user.lpVolume === 0) {
          myVolume.value = `$${formatMoney(toBN(result.user.lpVolume).toFixed(0), 0)}`
        } else {
          myVolume.value = '<$1'
        }
        if (result.user.lpReward >= 0.01 || result.user.lpReward === 0) {
          myEarnings.value = `$${formatMoney(toBN(result.user.lpReward).toFixed(2))}`
        } else {
          myEarnings.value = '<$0.01'
        }
      } else {
        myVolume.value = '-'
        myEarnings.value = '-'
      }
    }

    onMounted(() => {
      getAndSetAggregate()
    })

    watch(account, getAndSetAggregate)

    return {
      date,
      t,
      tip1Visible,
      tip2Visible,
      tip3Visible,
      content1Visible,
      content2Visible,
      content3Visible,
      totalVolume,
      myVolume,
      myEarnings
    }
  }
})
</script>

<style scoped>
  .oneline {
    white-space: nowrap;
    text-overflow:ellipsis;
    overflow:hidden;
  }
</style>
