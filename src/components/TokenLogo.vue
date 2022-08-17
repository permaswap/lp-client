<template>
  <img :class="symbol.toLowerCase() ==='vrt' ? '' : 'rounded-full'" :src="require(`@/images/token/${logoName}`)">
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

const tokenListHasLogo = [
  'wbtc',
  'vrt',
  'usdt',
  'usdc',
  'uni',
  'sos',
  'eth',
  'dai',
  'ar',
  'ardrive',
  'xyz',
  'glmr',
  'dodo',
  'mask',
  'bank',
  'zlk',
  'cfx',
  't4ever',
  'fox',
  'bnb',
  'lat',
  'xsgd'
]

export default defineComponent({
  props: {
    symbol: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const logoName = computed(() => {
      if (props.symbol && tokenListHasLogo.some(name => name === props.symbol.toLowerCase())) {
        return `${props.symbol.toLowerCase()}.png`
      } else {
        return 'default.svg'
      }
    })
    return {
      logoName
    }
  }
})
</script>
