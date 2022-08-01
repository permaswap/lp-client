<script>
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const store = useStore()
    const account = computed(() => store.state.account)
    const accountModalVisible = computed(() => store.state.accountModalVisible)
    const links1 = [
      {
        name: 'github',
        url: 'https://github.com/permaswap/lp-client'
      },
      {
        name: 'twitter',
        url: 'https://twitter.com/permaswap'
      },
      {
        name: 'medium',
        url: 'https://medium.com/everfinance'
      },
      {
        name: 'telegram',
        url: 'https://t.me/FinanceEver'
      }
    ]
    const links2 = [
      {
        name: 'everpay',
        url: 'https://everpay.io'
      },
      {
        name: 'everfinance',
        url: 'https://ever.finance'
      }
    ]
    const hidenAccountModal = () => store.commit('updateAccountModalVisible', false)
    const showRegisterModal = () => {
      store.commit('updateAccountModalVisible', false)
      store.commit('updateRegisterModalVisible', true)
    }
    return {
      account,
      links1,
      links2,
      accountModalVisible,
      hidenAccountModal,
      showRegisterModal
    }
  }
})
</script>

<template>
  <div
    :class="accountModalVisible ? 'block' : 'hidden'"
    style="background: #161E1B;border-radius: 12px;right:64px;top: 76px;width:440px;"
    class="absolute">
    <div class="flex flex-row items-center justify-between pt-6 px-6 pb-4">
      <div style="font-size:20px;">
        Balance on everPay
      </div>
      <img class="cursor-pointer" src="@/images/close.png" @click="hidenAccountModal">
    </div>
    <div v-if="account" style="background:rgba(24, 59, 33, 0.3)" class="py-6 px-5">
      <div class="flex flex-row mb-4" style="background: #161E1B;height:126px;border-radius: 12px;">
        <div class="flex flex-col items-center" style="margin:24px 70px 14px;">
          <div style="font-size:24px;" class="mb-2">
            -
          </div>
          <div class="text-sm mb-1.5">
            PSN
          </div>
        </div>
        <div class="flex flex-col items-center" style="margin:24px 0 14px;">
          <div style="font-size:24px;" class="mb-2">
            0
          </div>
          <div class="text-sm mb-1.5">
            NFT
          </div>
          <a
            href="https://permaswap.network/#/nft"
            target="_blank"
            class="text-xs"
            style="color: #D3B078;">
            Buy Now
          </a>
        </div>
      </div>
      <div class="flex flex-row items-center justify-between">
        <div
          class="rounded-lg h-8 text-center text-sm border-box leading-8 cursor-pointer"
          style="width:188px; border: 1px solid #183B21;">
          Copy
        </div>
        <a
          href="https://app.everpay.io/deposit"
          target="_blank"
          class="block rounded-lg h-8 text-center text-sm text-black leading-8 cursor-pointer"
          style="width:188px;background: #79D483;">
          Deposit
        </a>
      </div>
    </div>
    <div v-else style="background:rgba(24, 59, 33, 0.3)" class="p-6">
      <div
        class="h-12 text-center rounded-lg text-black cursor-pointer"
        style="background: #79D483;border: 1px solid rgba(121, 212, 131, 0.08);line-height: 48px;"
        @click="showRegisterModal">
        Sign Up
      </div>
    </div>
    <ul class="p-6 text-sm" style="color: rgba(255, 255, 255, 0.85);">
      <li class="flex flex-row items-center mb-4">
        <img class="w-4 mr-3" src="@/images/lang.png">
        <span>English</span>
      </li>
      <li :class="account ? 'mb-4' : ''">
        <a
          class="flex flex-row items-center"
          href="https://mirror.xyz/permaswap.eth/ustZcDgavlm4xmYI26thEAj8W2cXlZpRkG5Jqz0iS14"
          target="_blank">
          <img class="w-4 mr-3" src="@/images/paper.png">
          <span>Whitepaper</span>
        </a>
      </li>
      <li v-if="account" class="flex flex-row items-center cursor-pointer">
        <img class="w-4 mr-3" src="@/images/disconnect.png">
        <span>Disconnect</span>
      </li>
    </ul>
    <div style="border-top: 1px solid rgba(0, 10, 5, 0.45);" class="p-6 flex flex-row items-center justify-between">
      <div class="flex flex-row items-center">
        <a
          v-for="(link, index) in links1"
          :key="index"
          :href="link.url"
          target="_blank">
          <img :src="require(`@/images/${link.name}.png`)" class="w-5 h-5 mr-3">
        </a>
      </div>
      <div class="flex flex-row items-center">
        <a
          v-for="(link, index) in links2"
          :key="index"
          :href="link.url"
          target="_blank">
          <img :src="require(`@/images/${link.name}.png`)" class="w-5 h-5 ml-3">
        </a>
      </div>
    </div>
  </div>
</template>
