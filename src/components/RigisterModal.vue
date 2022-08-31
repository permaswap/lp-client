<script lang="ts">
import { initSocket, sendRegister, sendSign } from '@/lib/swap'
import { useStore } from '@/store'
import ethereumLib from 'everpay/esm/lib/ethereum'
import { computed, defineComponent, ref } from 'vue'
import { ethers, Wallet } from 'ethers'
import { toBN } from '@/lib/util'
import { swapX, swapY } from '@/lib/math'
import Everpay from 'everpay'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  setup () {
    const store = useStore()
    const { t, locale } = useI18n()
    const privateKey = ref(store.state.privateKey)
    const importNoticeVisible = ref(false)
    const registerModalVisible = computed(() => store.state.registerModalVisible)
    const isPrivateKeyValid = computed(() => {
      return /[a-fA-F0-9]{64}/gi.test(privateKey.value)
    })
    const hidenRegisterModal = () => store.commit('updateRegisterModalVisible', false)
    const handleRegister = () => {
      if (!isPrivateKeyValid.value) {
        return
      }
      const wallet = new Wallet(privateKey.value)
      initSocket({
        handleError (error: any) {
          console.log('error', error)
        },
        handleOpen (data: any) {
          console.log('open', data)
        },
        async handleSalt (data: any) {
          const signer = new ethers.Wallet(wallet.privateKey)
          console.log('salt', data.salt)
          const sig = await ethereumLib.signMessageAsync(signer, wallet.address, data.salt)
          sendRegister({
            address: wallet.address,
            sig
          })
          store.commit('updateAccount', wallet.address)
          store.commit('updatePrivateKey', privateKey.value)
          store.commit('updateRegisterModalVisible', false)
        },
        async handleOrder (data: any) {
          const validatePathsData = (paths: any): boolean => {
            const stack = {} as any
            let result: boolean = true
            paths.forEach((pathData: any) => {
              if (!stack[pathData.lpId]) {
                stack[pathData.lpId] = {}
              }
              if (pathData.to.toLowerCase() === wallet.address.toLowerCase()) {
                stack[pathData.lpId].amountIn = pathData.amount
                stack[pathData.lpId].tokenTagIn = pathData.tokenTag
              }
              if (pathData.from.toLowerCase() === wallet.address.toLowerCase()) {
                stack[pathData.lpId].amountOut = pathData.amount
                stack[pathData.lpId].tokenTagOut = pathData.tokenTag
              }
            })
            console.log('stack', stack)
            Object.entries(stack).forEach(([lpId, amountData]) => {
              const jsonConfig = store.state.lps.find(jsonConfig => {
                return jsonConfig.lpId === lpId
              })
              console.log('jsonConfig', jsonConfig)
              if (jsonConfig) {
                if ((amountData as any).tokenTagIn === jsonConfig.tokenX) {
                  try {
                    const [newCurrentSqrtPrice, amountOutY] = swapX((amountData as any).amountIn, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, jsonConfig.feeRatio)
                    console.log('amountOutY', amountOutY)
                    if (toBN(amountOutY).gte((amountData as any).amountOut)) {
                      store.commit('updateLp', {
                        ...jsonConfig,
                        currentSqrtPrice: newCurrentSqrtPrice
                      })
                    } else {
                      result = false
                    }
                  } catch (e) { console.log('errr', e) }
                } else if ((amountData as any).tokenTagOut === jsonConfig.tokenX) {
                  try {
                    const [newCurrentSqrtPrice, amountOutX] = swapY((amountData as any).amountIn, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, jsonConfig.feeRatio)
                    console.log('amountOutY', amountOutX)
                    console.log('amountOutPath', amountOutX)
                    if (toBN(amountOutX).gte((amountData as any).amountOut)) {
                      store.commit('updateLp', {
                        ...jsonConfig,
                        currentSqrtPrice: newCurrentSqrtPrice
                      })
                    } else {
                      result = false
                    }
                  } catch (e) {
                    console.log('errr', e)
                  }
                }
              }
            })
            return result
          }

          console.log('order', data)
          const validate = validatePathsData(data.paths)
          console.log('validate', validate)
          if (validate) {
            const signer = new ethers.Wallet(privateKey.value)
            const everpayWithAccount = new Everpay({
              account: signer.address,
              ethConnectedSigner: signer,
              chainType: 'ethereum' as any,
              debug: true
            })

            const bundleDataWithSigs = await everpayWithAccount.signBundleData(data.bundle)
            sendSign({
              address: wallet.address,
              bundle: bundleDataWithSigs
            })
          }
        }
      })
    }
    return {
      t,
      locale,
      registerModalVisible,
      privateKey,
      hidenRegisterModal,
      handleRegister,
      isPrivateKeyValid,
      importNoticeVisible
    }
  }
})
</script>

<template>
  <div
    class="absolute border-box p-8"
    :class="registerModalVisible ? 'block' : 'hidden'"
    style="width:480px;height: 610px; top: 162px;left:50%;transform: translateX(-50%);background: #161E1B;
border-radius: 24px;z-index: 9;">
    <div class="pb-4 mb-6" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div class="flex flex-row items-center justify-between">
        <span style="font-size: 20px;" class="mb-2">{{ t('registration_node') }}</span>
        <img class="cursor-pointer" src="@/images/close.png" @click="hidenRegisterModal">
      </div>
      <div>
        <span class="text-sm" style="color: rgba(255, 255, 255, 0.65);">{{ t('hold_nft_register_1') }}</span>
        <a
          class="text-sm ml-2"
          style="color: #D3B078;"
          href="https://permaswap.network/#/nft"
          target="_blank">{{ t('buy_nfts') }}</a>
      </div>
    </div>
    <ul class="text-sm mb-6" style="color: rgba(255, 255, 255, 0.65); list-style-type: circle;margin-left: 16px;">
      <li class="mb-2" style="color: #FFC53D;">
        {{ t('import_warn_1') }}
      </li>
      <li>{{ t('import_warn_2') }}</li>
    </ul>
    <div class="mb-6">
      <div class="mb-4">
        {{ t('select_format') }}
      </div>
      <div
        class="border-box pl-6 text-sm cursor-pointer"
        style="color: #79D483;width: 196px;height: 38px;line-height:38px;background: #000A06;border: 1px solid #79D483;border-radius: 8px;">
        Ethereum
      </div>
    </div>
    <div class="mb-8">
      <div class="mb-4 flex flex-row items-center">
        <div>{{ t('import_pk') }}</div>
        <div class="ml-2 relative" @mouseover="importNoticeVisible = true" @mouseleave="importNoticeVisible = false">
          <img src="@/images/warning.png" class="cursor-pointer">
          <div
            v-if="importNoticeVisible"
            class="absolute border-box p-3 text-xs cursor-pointer"
            style="
              width:320px;
              background: #363F3B;
              box-shadow: 0px 1px 2px -2px rgba(0, 10, 6, 0.16), 0px 3px 6px rgba(0, 10, 6, 0.12), 0px 5px 12px 4px rgba(0, 10, 6, 0.09);
              border-radius: 12px;
              left: -30px;
            "
            :style="locale === 'en' ? 'top:-150px;' : 'top:-100px;'"
          >
            {{ t('import_notice') }}
            <img
              src="@/images/arrow.png"
              class="absolute"
              style="bottom:-27px;">
          </div>
        </div>
      </div>
      <textarea
        v-model="privateKey"
        class="privatekey-area p-3 block m-0"
        style="resize: none;width: 416px;height: 68px;background: #000A06;border-radius: 12px;"
        placeholder="Please paste your private key" />
      <span v-if="privateKey && !isPrivateKeyValid" style="color: #FF7D69;" class="text-xs">
        {{ t('pk_notice') }}
      </span>
    </div>
    <div class="flex flex-row items-center justify-between">
      <div
        class="border-box cursor-pointer"
        style="border: 1px solid #183B21;color: #79D483;border-radius: 8px;width: 196px;height:48px;line-height:48px;text-align:center;"
        @click="hidenRegisterModal">
        {{ t('cancel') }}
      </div>
      <div
        :class="isPrivateKeyValid ? 'primary-btn' : 'disable-btn'"
        style="border-radius: 8px;width: 196px;height:48px;line-height:48px;text-align:center;"
        @click="handleRegister">
        {{ t('sign_up') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .privatekey-area {
    font-size: 14px;
    ::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    outline: 0;
    :focus {
      outline: none;
    }
  }
  .primary-btn {
    background: #79D483;
    color: #000000;
    cursor: pointer;
  }
  .disable-btn {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
  }
</style>
