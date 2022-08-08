<script lang="ts">
import { initSocket, sendRegister } from '@/lib/swap'
import { useStore } from '@/store'
import ethereumLib from 'everpay/esm/lib/ethereum'
import { computed, defineComponent, ref } from 'vue'
import { ethers, Wallet } from 'ethers'

export default defineComponent({
  setup () {
    const store = useStore()
    const privateKey = ref(store.state.privateKey)
    const registerModalVisible = computed(() => store.state.registerModalVisible)
    const isPrivateKeyValid = computed(() => {
      return /[a-zA-Z0-9]{64}/gi.test(privateKey.value)
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
        }
      })
    }
    return {
      registerModalVisible,
      privateKey,
      hidenRegisterModal,
      handleRegister,
      isPrivateKeyValid
    }
  }
})
</script>

<template>
  <div
    class="absolute border-box p-8"
    :class="registerModalVisible ? 'block' : 'hidden'"
    style="width:480px;height: 610px; top: 162px;left:50%;transform: translateX(-50%);background: #161E1B;
border-radius: 24px;">
    <div class="pb-4 mb-6" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
      <div class="flex flex-row items-center justify-between">
        <span style="font-size: 20px;" class="mb-2">Registration node</span>
        <img class="cursor-pointer" src="@/images/close.png" @click="hidenRegisterModal">
      </div>
      <div>
        <span class="text-sm" style="color: rgba(255, 255, 255, 0.65);">Holding certified NFT to register as a node</span>
        <a
          class="text-sm ml-2"
          style="color: #D3B078;"
          href="https://permaswap.network/#/nft"
          target="_blank">Buy Now</a>
      </div>
    </div>
    <ul class="text-sm mb-6" style="color: rgba(255, 255, 255, 0.65); list-style-type: circle;margin-left: 16px;">
      <li class="mb-2" style="color: #FFC53D;">
        We will not save your private key, please import it in a secure environment!
      </li>
      <li>Only one role is supported for the same account, i.e. to become an Lp node and will not be able to exchange in the Permaswap DApp.</li>
    </ul>
    <div class="mb-6">
      <div class="mb-4">
        Select Format
      </div>
      <div
        class="border-box pl-6 text-sm cursor-pointer"
        style="color: #79D483;width: 196px;height: 38px;line-height:38px;background: #000A06;border: 1px solid #79D483;border-radius: 8px;">
        Ethereum
      </div>
    </div>
    <div class="mb-8">
      <div class="mb-4">
        Import Private Key
      </div>
      <textarea
        v-model="privateKey"
        class="privatekey-area p-3 block m-0"
        style="resize: none;width: 416px;height: 68px;background: #000A06;border-radius: 12px;"
        placeholder="Please paste your private key" />
      <span style="color: #FF7D69;" class="text-xs">Expected private key to be a string with length 64</span>
    </div>
    <div class="flex flex-row items-center justify-between">
      <div
        class="border-box cursor-pointer"
        style="border: 1px solid #183B21;color: #79D483;border-radius: 8px;width: 196px;height:48px;line-height:48px;text-align:center;"
        @click="hidenRegisterModal">
        Cancel
      </div>
      <div
        :class="isPrivateKeyValid ? 'primary-btn' : 'disable-btn'"
        style="border-radius: 8px;width: 196px;height:48px;line-height:48px;text-align:center;"
        @click="handleRegister">
        Sign Up
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
