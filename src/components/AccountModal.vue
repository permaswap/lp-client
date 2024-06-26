<script lang="ts">
import { closeSocket } from '@/lib/swap'
import { useStore } from '@/store'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import ClipboardJS from 'clipboard'
import { useI18n } from 'vue-i18n'
import { savedI18nStorageKey } from '@/constants'
import DisconnectModal from './DisconnectModal.vue'
import { checkParentsHas, isValidVersion } from '@/lib/util'
import VersionModal from './VersionModal.vue'

export default defineComponent({
  components: { DisconnectModal, VersionModal },
  setup () {
    const store = useStore()
    const { t } = useI18n()
    const disconnectConfirmModalVisible = ref(false)
    const account = computed(() => store.state.account)
    const accountModalVisible = computed(() => store.state.accountModalVisible)
    const copyedNoticeVisible = ref(false)
    const versionModalVisible = ref(false)
    const depositTipVisible = ref(false)
    const { locale } = useI18n({ useScope: 'global' })
    const nftNums = computed(() => {
      const holderToNFTs = store.state.holderToNFTs
      if (holderToNFTs[account.value]) {
        return holderToNFTs[account.value].length
      } else {
        return '0'
      }
    })
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
        url: 'https://medium.com/permaswap'
      },
      {
        name: 'discord',
        url: 'https://discord.gg/WM5MQZGVPF'
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
      if (!isValidVersion(store.state.info.lpClientInfo['lp-javascript'].version)) {
        store.commit('updateDownloadModalVisible', true)
        store.commit('updateAccountModalVisible', false)
      } else {
        store.commit('updateAccountModalVisible', false)
        store.commit('updateRegisterModalVisible', true)
      }
    }
    const showVersisonModal = () => {
      store.commit('updateAccountModalVisible', false)
      versionModalVisible.value = true
    }
    const disconnect = () => {
      disconnectConfirmModalVisible.value = false
      const lps = [...store.state.lps]
      lps.forEach((lp) => {
        store.commit('removeLp', lp)
      })
      store.commit('updateAccountModalVisible', false)
      store.commit('updateAccount', '')
      store.commit('updateManualConnect', false)
      closeSocket()
    }

    const showDisconnectModal = () => {
      hidenAccountModal()
      disconnectConfirmModalVisible.value = true
    }

    const localesOpen = ref(false)
    const changeLocale = (lang: string) => {
      window.localStorage.setItem(savedI18nStorageKey, lang)
      locale.value = lang
    }

    let clipboard = null as any
    let timer = null as any

    onMounted(() => {
      clipboard = new ClipboardJS('.clipboard-modal-account')
      clipboard.on('success', (e: any) => {
        e.clearSelection()
        copyedNoticeVisible.value = true
        if (timer != null) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          copyedNoticeVisible.value = false
        }, 2000)
      })

      const isAccountModal = checkParentsHas('account-modal')
      const isAccountModalTrigger = checkParentsHas('account-modal-trigger')

      document.addEventListener('click', (e) => {
        if (!isAccountModal(e.target as any) && !isAccountModalTrigger(e.target as any)) {
          hidenAccountModal()
        }
      })

      store.dispatch('updateInfoAsync')
    })

    onUnmounted(() => {
      clipboard && clipboard.destroy()
    })

    return {
      depositTipVisible,
      versionModalVisible,
      showDisconnectModal,
      t,
      nftNums,
      disconnectConfirmModalVisible,
      locale,
      account,
      localesOpen,
      changeLocale,
      links1,
      links2,
      disconnect,
      copyedNoticeVisible,
      accountModalVisible,
      hidenAccountModal,
      showRegisterModal,
      showVersisonModal
    }
  }
})
</script>

<template>
  <div
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:76px;left:0;z-index:20;"
    :class="accountModalVisible ? 'block' : 'hidden'">
    <div
      style="background: #242D2A;border-radius: 12px;right:64px;top: 0;width:440px;"
      class="absolute account-modal">
      <div class="flex flex-row items-center justify-between pt-6 px-6 pb-4">
        <div style="font-size:20px;">
          {{ t('setting') }}
        </div>
        <img class="cursor-pointer" src="@/images/close.png" @click="hidenAccountModal">
      </div>
      <div v-if="account && false" style="background:rgba(24, 59, 33, 0.3)" class="py-6 px-5">
        <div v-if="false" class="flex flex-row mb-4 relative" style="background: #161E1B;height:126px;border-radius: 12px;">
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
              {{ nftNums }}
            </div>
            <div class="text-sm mb-1.5">
              NFT
            </div>
            <a
              href="https://app.permaswap.network/#/nft"
              target="_blank"
              class="text-xs"
              style="color: #D3B078;">
              {{ t('buy_nfts') }}
            </a>
          </div>
          <img class="absolute right-0 top-0" style="height:126px;" src="@/images/background.png">
        </div>
        <div v-if="false" class="flex flex-row items-center justify-between">
          <div
            class="rounded-lg h-8 text-center text-sm border-box leading-8 cursor-pointer relative clipboard-modal-account"
            :data-clipboard-text="account"
            style="width:188px; border: 1px solid rgba(121, 212, 131, 0.25);">
            {{ t('copy') }}
            <div
              v-if="copyedNoticeVisible"
              class="absolute py-1 px-4 text-sm"
              style="left:50%;top:-48px;transform: translateX(-50%);color: #79D483;background: rgba(54, 63, 59, 0.65);border-radius: 6px;">
              {{ t('replicated') }}
            </div>
          </div>
          <div class="relative" @mouseover="depositTipVisible = true" @mouseleave="depositTipVisible = false">
            <a
              href="https://app.everpay.io/deposit"
              target="_blank"
              class="block rounded-lg h-8 text-center text-sm text-black leading-8 cursor-pointer"
              style="width:188px;background: #79D483;">
              {{ t('deposit') }}
            </a>
            <div
              v-if="depositTipVisible"
              class="p-3 absolute text-xs border-box"
              style="background: #363F3B;border-radius: 12px;width:320px;right:0;bottom:48px;color:#fff;">
              {{ t('deposit_tip') }}
              <img
                src="@/images/arrow-2.png"
                class="absolute"
                style="width:18px;height:8px;bottom:-8px;right:32px;">
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="!account" style="background:rgba(24, 59, 33, 0.3)" class="p-6">
        <div
          class="h-12 text-center rounded-lg text-black cursor-pointer"
          style="background: #79D483;border: 1px solid rgba(121, 212, 131, 0.08);line-height: 48px;"
          @click="showRegisterModal">
          {{ t('sign_up') }}
        </div>
      </div>
      <ul class="p-6 text-sm" style="color: rgba(255, 255, 255, 0.85);">
        <li class="mb-4">
          <div class="flex flex-row items-center cursor-pointer">
            <div class="flex flex-col items-center mr-3" style="width: 20px;">
              <img src="@/images/lang.png" style="width:17px;height:17px;">
            </div>
            <div class="flex flex-row items-center" @click="localesOpen = !localesOpen">
              <span>{{ locale === 'zh' ? '繁体中文' : 'English' }}</span>
              <img src="@/images/arrow-top.png" class="transform w-5 ml-1" :class="localesOpen ? '' : 'rotate-180'">
            </div>
          </div>
          <div v-if="localesOpen" class="ml-8">
            <div
              class="mt-2 cursor-pointer"
              :style="locale === 'en' ? 'color:#79D483;' : ''"
              @click="changeLocale('en')">
              English
            </div>
            <div
              class="mt-2 cursor-pointer"
              :style="locale === 'zh' ? 'color:#79D483;' : ''"
              @click="changeLocale('zh')">
              繁体中文
            </div>
          </div>
        </li>
        <li class="cursor-pointer" :class="account ? 'mb-4' : ''" @click="showVersisonModal">
          <div
            class="flex flex-row items-center">
            <div class="flex flex-col items-center mr-3" style="width: 20px;">
              <img src="@/images/version.png" style="height:20px;width:20px;">
            </div>
            <span>{{ t('version_update') }}</span>
          </div>
        </li>
        <li v-if="account" class="flex flex-row items-center cursor-pointer" @click="showDisconnectModal">
          <div class="flex flex-col items-center mr-3" style="width: 18px;">
            <img src="@/images/disconnect.png" style="height:16px;margin-left: 3px;">
          </div>
          <span>{{ t('disconnect') }}</span>
        </li>
      </ul>
      <ul class="p-6 text-sm" style="color: rgba(255, 255, 255, 0.85);border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <li class="mb-4">
          <a
            class="flex flex-row items-center"
            href="https://mirror.xyz/permaswap.eth/ustZcDgavlm4xmYI26thEAj8W2cXlZpRkG5Jqz0iS14"
            target="_blank">
            <div class="flex flex-col items-center mr-3" style="width: 20px;">
              <img src="@/images/paper.png" style="height:17px;width:14px;">
            </div>
            <span>{{ t('whitepaper') }}</span>
          </a>
        </li>
        <li class="mb-4">
          <a
            class="flex flex-row items-center"
            href="https://arseed.web3infra.dev/RGcaT5ZztAGF0k62CHPILNCT5_XMuJpeoDMb7nRwkqo"
            target="_blank">
            <div class="flex flex-col items-center mr-3" style="width: 20px;">
              <img src="@/images/audit-report.png" style="height:17px;width:14px;">
            </div>
            <span>{{ t('audit_report') }}</span>
          </a>
        </li>
        <li>
          <a
            class="flex flex-row items-center"
            href="https://www.notion.so/PermaSwap-WIKI-EN-485cd6623f954902b61775e4f1a86717"
            target="_blank">
            <div class="flex flex-col items-center mr-3" style="width: 20px;">
              <img src="@/images/wiki.png" style="height:20px;width:20px;">
            </div>
            <span>Wiki</span>
          </a>
        </li>
        <!-- <li>
          <a
            class="flex flex-row items-center"
            href="https://permadao.com"
            target="_blank">
            <div class="flex flex-col items-center mr-3" style="width: 20px;">
              <img src="@/images/permadao.png" style="height:20px;width:20px;">
            </div>
            <span>PermaDAO</span>
          </a>
        </li> -->
      </ul>
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.08);" class="p-6 flex flex-row items-center justify-between">
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
  </div>
  <disconnect-modal
    v-if="disconnectConfirmModalVisible"
    @closeModal="disconnectConfirmModalVisible = false"
    @confirmDisconnect="disconnect"
  />
  <version-modal v-if="versionModalVisible" @close-modal="versionModalVisible = false" />
</template>
