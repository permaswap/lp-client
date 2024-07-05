<template>
  <img :class="symbol.toLowerCase() ==='vrt' ? '' : 'rounded-full'" :src="require(`@/images/token/${logoName}`)">
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

const tokenListHasLogoPng = [
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
  'xsgd',
  'tar',
  'tusdc',
  'tardrive',
  'acnh',
  'ans',
  'u',
  'stamp',
  'map',
  'mapo',
  'bp'
]
const tokenListHasLogoSvg = [
  'aocred',
  '0rbt',
  'halo',
  'trunk',
  'exp(ario)'
]

export default defineComponent({
  props: {
    symbol: {
      type: String,
      default: ''
    },
    chainType: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    const logoName = computed(() => {
      if (props.chainType.includes('aostest') && props.symbol.toUpperCase() === 'AR') {
        return 'war.png'
      }
      if (props.symbol && tokenListHasLogoSvg.some(name => name === props.symbol.toLowerCase())) {
        return `${props.symbol.toLowerCase()}.svg`
      } else if (props.symbol && tokenListHasLogoPng.some(name => name === props.symbol.toLowerCase())) {
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
