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
            value="$1,000,000"
            :info-message="t('ans_mining.tvl_tip')"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.join_tvl')"
            value="$1,000,000"
            :info-message="t('ans_mining.join_tvl_tip')"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.ans_total_reward')"
            value="300 ANS"
            :highlight="true"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.apr')"
            value="11.21%"
          />
          <mining-row
            :label="t('ans_mining.period')"
            :value="t('ans_mining.1month')"
          />
        </div>
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            :label="t('ans_mining.my_apr')"
            value="10.2%"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.sent_reward')"
            value="11.82 ANS"
            :info-message="t('ans_mining.sent_reward_tip')"
          />
          <mining-row
            :label="t('ans_mining.single_day_est_reward')"
            value="10 ANS"
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
            <a href="#" target="_blank" style="color: #D3B078;">{{ t('ans_mining.more_rule') }}</a>
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
            value="50AR"
            :highlight="true"
          />
          <mining-row
            class="mb-4"
            :label="t('ans_mining.ans_total_volume')"
            value="$1,000,000"
            :info-message="t('ans_mining.ans_total_volume_tip')"
          />
          <mining-row
            :label="t('ans_mining.duration')"
            :value="t('ans_mining.2weeks')"
          />
        </div>
        <div
          class="py-3 px-4"
          style="background: rgba(22, 30, 27, 0.45);border: 1px solid rgba(164, 224, 169, 0.25);border-radius: 12px;"
        >
          💰{{ t('ans_mining.trading_tip_1') }}
          <a href="https://app.permaswap.network/ANS-USDC" target="_blank" style="color: #79D483;">
            {{ t('ans_mining.trading_tip_2') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import MiningRow from './MiningRow.vue'
import { checkParentsHas } from '@/lib/util'

export default defineComponent({
  components: { MiningRow },
  setup () {
    const store = useStore()
    const miningModalVisible = computed(() => store.state.miningModalVisible)
    const tab = ref('liquidity')
    const { t } = useI18n()
    const hideMiningModal = () => store.commit('updateMiningModalVisible', false)

    const isMiningModal = checkParentsHas('mining-modal')
    const isMiningModalTrigger = checkParentsHas('mining-modal-trigger')

    onMounted(() => {
      document.addEventListener('click', (e) => {
        if (!isMiningModal(e.target as any) && !isMiningModalTrigger(e.target as any)) {
          hideMiningModal()
        }
      })
    })

    return {
      miningModalVisible,
      hideMiningModal,
      tab,
      t
    }
  }
})
</script>
