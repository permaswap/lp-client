<template>
  <div
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:76px;left:0;z-index:20;"
    :class="miningModalVisible ? 'block' : 'hidden'">
    <div
      style="background: #242D2A;border-radius: 12px;right:64px;top: 0;width:440px;"
      class="absolute p-6">
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
            Liquidity
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
            Trading
            <div
              v-if="tab === 'trading'"
              class="absolute w-full left-0"
              style="height:2px;background: #79D483; bottom:-17px"
            />
          </div>
        </div>
        <img class="cursor-pointer" src="@/images/close.png" @click="miningModalVisible = false">
      </div>

      <div :class="tab === 'liquidity' ? 'block' : 'hidden'">
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            label="TVL($)"
            value="$1,000,000"
            info-message="TVL for AR/ANS"
          />
          <mining-row
            class="mb-4"
            label="Participating TVL($)"
            value="$1,000,000"
            info-message="Amount of TVL for AR/ANS actually participating in the event"
          />
          <mining-row
            class="mb-4"
            label="Total Award"
            value="300 ANS"
            :highlight="true"
          />
          <mining-row
            class="mb-4"
            label="APR"
            value="11.21%"
          />
          <mining-row
            label="Duration"
            value="1 month"
          />
        </div>
        <div
          class="p-4 mb-4"
          style="background: rgba(22, 30, 27, 0.45);border-radius: 12px;"
        >
          <mining-row
            class="mb-4"
            label="My APR"
            value="10.2%"
          />
          <mining-row
            class="mb-4"
            label="My Awarded Rewards"
            value="11.82 ANS"
            info-message="Total amount of rewards issued to your current address"
          />
          <mining-row
            label="My Undistributed Est. rewards"
            value="10 ANS"
            info-message="The actual rewards is obtained as the actual data changes. The actual rewards is given at the time of settlement"
          />
        </div>
        <ul
          class="pt-4 text-xs list-disc pl-4"
          style="color: rgba(255, 255, 255, 0.45);border-top: 1px solid rgba(255, 255, 255, 0.08);line-height: 20px;"
        >
          <li>The data is counted every 1 minute. Subject to end of activity data.</li>
          <li>During Active, the data is dynamic and changes with the actual data.</li>
          <li style="color: #D3B078;">
            <a href="#" target="_blank" style="color: #D3B078;">More Rules  ↗︎</a>
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
            label="Total Rewards"
            value="50AR"
            :highlight="true"
          />
          <mining-row
            class="mb-4"
            label="ANS Total Volume ($)"
            value="$1,000,000"
            info-message="ANS-related cumulative transactions during the event"
          />
          <mining-row
            label="Duration"
            value="2 weeks"
          />
        </div>
        <div
          class="py-3 px-4"
          style="background: rgba(22, 30, 27, 0.45);border: 1px solid rgba(164, 224, 169, 0.25);border-radius: 12px;"
        >
          💰Participate in ANS trading events and get more rewards !
          <a href="https://app.permaswap.network/ANS-USDC" target="_blank" style="color: #79D483;">
            Go to swap  ↗︎
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import MiningRow from './MiningRow.vue'

export default defineComponent({
  components: { MiningRow },
  setup () {
    const miningModalVisible = ref(true)
    const tab = ref('trading')
    return {
      miningModalVisible,
      tab
    }
  }
})
</script>
