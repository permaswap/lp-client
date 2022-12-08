<script lang="ts">
import { initSocket, sendRegister, sendSign, isProd, sendAdd, getOrderHash, getTotalTxsByCursor } from '@/lib/swap'
import { useStore } from '@/store'
import Arweave from 'arweave'
// import ethereumLib from 'everpay/esm/lib/ethereum'
// import arweaveLib from 'everpay/esm/lib/arweave'
import { signMessageAsync } from 'everpay/esm/lib/sign'
import { computed, defineComponent, onMounted, ref } from 'vue'
import { ethers, Wallet } from 'ethers'
import { toBN } from '@/lib/util'
import { getAmountXY, swapX, swapY } from '@/lib/math'
import Everpay from 'everpay'
import { useI18n } from 'vue-i18n'
import { permaMessage } from './Message'
import { lpClientName, lpClientVerison } from '@/constants'
import { Token } from 'everpay/esm/types'
import { getTokenByTag } from 'everpay/esm/utils/util'

const formatFilename = (name: string) => {
  if (name.length < 30) {
    return name
  }
  return `${name.slice(0, 15)}...${name.slice(-15)}`
}

const getTotalLpAmountsStack = (lps: any[]) => {
  const stack = {} as any
  lps.forEach((lp: any) => {
    const amountXY = getAmountXY(lp.lowSqrtPrice, lp.currentSqrtPrice, lp.highSqrtPrice, lp.liquidity)
    const amountX = toBN(amountXY.amountX).dividedBy(toBN(10).pow(lp.tokenXDecimal))
    const amountY = toBN(amountXY.amountY).dividedBy(toBN(10).pow(lp.tokenYDecimal))
    if (stack[lp.tokenX]) {
      stack[lp.tokenX] = toBN(stack[lp.tokenX]).plus(amountX).toString()
    } else {
      stack[lp.tokenX] = amountX.toString()
    }
    if (stack[lp.tokenY]) {
      stack[lp.tokenY] = toBN(stack[lp.tokenY]).plus(amountY).toString()
    } else {
      stack[lp.tokenY] = amountY.toString()
    }
  })
  return stack
}

const checkBalanceEnough = (lpAmountsStack: any, tokens: Token[], balances: any[]) => {
  return Object.entries(lpAmountsStack).every(([tag, amount]): boolean => {
    const token = getTokenByTag(tag, tokens)
    const balanceItem = balances.find(b => b.symbol.toUpperCase() === token?.symbol.toUpperCase())
    return toBN(balanceItem.balance).gte(toBN(amount as string))
  })
}

export default defineComponent({
  setup () {
    const store = useStore()
    const { t, locale } = useI18n()
    const privateKey = ref(store.state.privateKey)
    const importNoticeVisible = ref(false)
    const fileInputRef = ref(null)
    const selectedFormat = ref('Ethereum')
    const jwkFileName = ref('')
    const registerModalVisible = computed(() => store.state.registerModalVisible)
    const isPrivateKeyValid = computed(() => {
      return /[a-fA-F0-9]{64}/gi.test(privateKey.value)
    })
    const isJwkValid = ref(false)
    let arAddress = ''
    let arJwk = {}

    // watch(fileList, () => {
    //   console.log('fileList', fileList.value)
    //   const reader = new FileReader()
    //   reader.readAsText(fileList.value[fileList.value.length - 1].raw, 'utf-8')
    //   reader.onload = (evt) => {
    //     console.log(evt)
    //   }
    // })

    const triggerFileInput = () => {
      (fileInputRef.value as any).click()
    }

    const loadFiles = async () => {
      if ((fileInputRef.value as any)?.files) {
        for (const file of (fileInputRef.value as any).files) {
          if (file.type !== 'application/json') continue
          const reader = new FileReader()

          try {
            reader.readAsText(file)
          } catch {
            permaMessage({
              showClose: true,
              message: `There was an error when loading ${file.name}`,
              type: 'error',
              duration: 3000
            })
          }

          reader.onabort = () =>
            permaMessage({
              showClose: true,
              message: 'File reading was aborted',
              type: 'error',
              duration: 3000
            })
          reader.onerror = () =>
            permaMessage({
              showClose: true,
              message: 'File reading has failed',
              type: 'error',
              duration: 3000
            })
          reader.onload = async (e) => {
            try {
              const keyfile = JSON.parse(
                e!.target!.result as string
              )
              jwkFileName.value = formatFilename(file.name)
              const arweave = Arweave.init({})
              arAddress = await arweave.wallets.jwkToAddress(keyfile)
              arJwk = keyfile
              isJwkValid.value = true
              console.log('arAddress', arAddress)
            } catch {
              arAddress = ''
              arJwk = {}
              isJwkValid.value = false
              // permaMessage({
              //   showClose: true,
              //   message: 'There was an error when loading a keyfile',
              //   type: 'error',
              //   duration: 3000
              // })
            }
          }
        }
      }
    }

    onMounted(() => {
      (fileInputRef.value as any).addEventListener('change', loadFiles)
    })

    const hidenRegisterModal = () => store.commit('updateRegisterModalVisible', false)
    let timer = null as any
    let socket = null as any
    const handleRegister = async () => {
      if ((selectedFormat.value === 'Ethereum' && !isPrivateKeyValid.value) ||
        (selectedFormat.value === 'Arweave' && !isJwkValid.value)) {
        return
      }
      const holderToNFTs = store.state.holderToNFTs
      const whitelist = store.state.whitelist
      let address = ''
      if (selectedFormat.value === 'Ethereum') {
        const wallet = new Wallet(privateKey.value)
        address = wallet.address
      } else if (selectedFormat.value === 'Arweave') {
        address = arAddress
      }

      if (!holderToNFTs[address] && !whitelist.includes(address)) {
        permaMessage({
          showClose: true,
          message: t('need_nft'),
          type: 'error',
          duration: 3000
        })
        return
      }

      const orderHashHandleStack = {} as any
      let lastEverHash = null as any

      const tryConnect = async (reconnect: boolean) => {
        let isProcessingOrder = false

        // 处理 status 还没返回，断开连接的情况
        if (reconnect && lastEverHash && Object.keys(orderHashHandleStack).length) {
          const everpay = new Everpay({ debug: !isProd })
          const txResult = await everpay.txByHash(lastEverHash)
          const rawId = (txResult as any).rawId
          const txs = await getTotalTxsByCursor(store.state.account, rawId)
          txs.forEach((tx: any) => {
            try {
              const internalStatus = JSON.parse(tx.internalStatus)
              const bundleData = JSON.parse(tx.data).bundle
              const orderHash = getOrderHash(bundleData)
              if (internalStatus.status !== 'success') {
                delete orderHashHandleStack[orderHash]
                return
              }
              if (orderHashHandleStack[orderHash]) {
                for (const func of orderHashHandleStack[orderHash]) {
                  func()
                }
                delete orderHashHandleStack[orderHash]
              }
            } catch (e) {
              console.log(e)
            }
          })
        }

        socket = initSocket({
          handleError (error: any) {
            console.log('error', error)
          },
          handleOpen (data: any) {
            console.log('open', data)
            store.commit('updateManualConnect', true)
            store.commit('updateSuccessConnect', true)
          },
          async handleSalt (data: any) {
            console.log('salt', data.salt)
            let sig = ''
            if (selectedFormat.value === 'Ethereum') {
              const signer = new Wallet(privateKey.value)
              const signResult = await signMessageAsync({
                account: signer.address,
                ethConnectedSigner: signer,
                chainType: 'ethereum' as any
              }, data.salt)
              sig = signResult.sig
            } else if (selectedFormat.value === 'Arweave') {
              const signResult = await signMessageAsync({
                account: arAddress,
                arJWK: arJwk as any,
                chainType: 'arweave' as any
              }, data.salt)
              sig = signResult.sig
            }

            sendRegister({
              address,
              lpClientName,
              lpClientVerison,
              sig
            })
            store.commit('updateAccount', address)
            store.commit('updatePrivateKey', '')
            store.commit('updateRegisterModalVisible', false)
            jwkFileName.value = ''
            isJwkValid.value = false
            if (!reconnect) {
              permaMessage({
                showClose: true,
                message: t('import_success'),
                type: 'success',
                duration: 3000
              })
            }

            if (reconnect) {
              console.log('reconnect')
              const everpay = new Everpay({ debug: !isProd })
              const [balances, info] = await Promise.all([
                everpay.balances({
                  account: store.state.account
                }),
                everpay.info()
              ])
              const lpAmountsStack = getTotalLpAmountsStack(store.state.lps)
              if (checkBalanceEnough(lpAmountsStack, info.tokenList, balances)) {
                setTimeout(() => {
                  store.state.lps.forEach((lp) => {
                    sendAdd(lp)
                  })
                }, 3000)
              } else {
                permaMessage({
                  showClose: true,
                  message: t('balance_not_enough'),
                  type: 'error',
                  duration: 3000
                })
                const lps = [...store.state.lps]
                lps.forEach((lp) => {
                  store.commit('removeLp', lp)
                })
              }
            }
          },
          async handleOrder (data: any) {
            const handler = async () => {
              const validatePathsData = (paths: any): boolean => {
                const stack = {} as any
                let result: boolean = true
                paths.forEach((pathData: any) => {
                  if (!stack[pathData.lpId]) {
                    stack[pathData.lpId] = {}
                  }
                  if (pathData.to.toLowerCase() === address.toLowerCase()) {
                    stack[pathData.lpId].amountIn = pathData.amount
                    stack[pathData.lpId].tokenTagIn = pathData.tokenTag
                  }
                  if (pathData.from.toLowerCase() === address.toLowerCase()) {
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
                        console.log('amountOutPath', (amountData as any).amountOut)
                        if (toBN(amountOutY).gte((amountData as any).amountOut)) {
                          const orderHashHandler = () => {
                            store.commit('updateLp', {
                              ...jsonConfig,
                              currentSqrtPrice: newCurrentSqrtPrice
                            })
                          }
                          if (!orderHashHandleStack[orderHash]) {
                            orderHashHandleStack[orderHash] = [orderHashHandler]
                          } else {
                            orderHashHandleStack[orderHash].push(orderHashHandler)
                          }
                        } else {
                          result = false
                        }
                      } catch (e) { console.log('errr', e) }
                    } else if ((amountData as any).tokenTagOut === jsonConfig.tokenX) {
                      try {
                        const [newCurrentSqrtPrice, amountOutX] = swapY((amountData as any).amountIn, jsonConfig.lowSqrtPrice, jsonConfig.currentSqrtPrice, jsonConfig.highSqrtPrice, jsonConfig.liquidity, jsonConfig.feeRatio)
                        console.log('amountOutX', amountOutX)
                        console.log('amountOutPath', (amountData as any).amountOut)
                        if (toBN(amountOutX).gte((amountData as any).amountOut)) {
                          const orderHashHandler = () => {
                            store.commit('updateLp', {
                              ...jsonConfig,
                              currentSqrtPrice: newCurrentSqrtPrice
                            })
                          }
                          if (!orderHashHandleStack[orderHash]) {
                            orderHashHandleStack[orderHash] = [orderHashHandler]
                          } else {
                            orderHashHandleStack[orderHash].push(orderHashHandler)
                          }
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
              const orderHash = getOrderHash(data.bundle)
              console.log('orderHash', orderHash)
              const validate = validatePathsData(data.paths)
              console.log('validate', validate)
              if (validate) {
                let everpayWithAccount: any
                if (selectedFormat.value === 'Ethereum') {
                  const signer = new ethers.Wallet(privateKey.value)
                  everpayWithAccount = new Everpay({
                    account: signer.address,
                    ethConnectedSigner: signer,
                    chainType: 'ethereum' as any,
                    debug: !isProd
                  })
                } else if (selectedFormat.value === 'Arweave') {
                  everpayWithAccount = new Everpay({
                    account: address,
                    arJWK: arJwk as any,
                    chainType: 'arweave' as any,
                    debug: !isProd
                  })
                }
                isProcessingOrder = true
                const bundleDataWithSigs = await everpayWithAccount.signBundleData(data.bundle)
                sendSign({
                  address: address,
                  bundle: bundleDataWithSigs
                })
              }
            }

            if (!isProcessingOrder) {
              store.state.lps.forEach((lp) => console.log('lp current price (handleOrder):', lp.lpId, lp.currentSqrtPrice))
              handler()
            } else {
              console.log('handling order. ignore new one.')
            }
          },
          async handleStatus (data: any) {
            const orderHash = data.orderHash
            lastEverHash = data.everHash
            if (orderHashHandleStack[orderHash]) {
              if (data.status === 'success') {
                console.log('update new current price')
                for (const func of orderHashHandleStack[orderHash]) {
                  func()
                }
              } else {
                console.log('failed')
              }
              delete orderHashHandleStack[orderHash]
            }
            store.state.lps.forEach((lp) => console.log('lp current price (handleStatus):', lp.lpId, lp.currentSqrtPrice))
            isProcessingOrder = false
          }
        })
      }

      const checkSocket = () => {
        if (timer != null) {
          clearTimeout(timer as any)
        }
        timer = setTimeout(async () => {
          console.log('socket.readyState', (socket as any).readyState)
          const readyState = (socket as any).readyState
          let networkError = false
          try {
            await store.dispatch('updateInfoAsync')
          } catch {
            networkError = true
          }
          const successConnect = !((readyState !== 0 && readyState !== 1) || networkError)
          if (!successConnect && store.state.manualConnect) {
            socket.close()
            tryConnect(true)
          }
          store.commit('updateSuccessConnect', successConnect)
          checkSocket()
        }, 5000)
      }

      tryConnect(false)
      checkSocket()
    }
    return {
      t,
      isJwkValid,
      jwkFileName,
      triggerFileInput,
      fileInputRef,
      selectedFormat,
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
    class="fixed"
    style="width:100%;height:100%;background:rgba(0, 10, 6,0.65);top:0;left:0;z-index: 20;"
    :class="registerModalVisible ? 'block' : 'hidden'">
    <div
      class="absolute border-box p-8"
      style="width:480px;height: 590px; top: 120px;left:50%;transform: translateX(-50%);background: #242D2A;
  border-radius: 24px;z-index: 9;box-shadow: 0px 6px 16px -8px rgba(0, 10, 6, 0.08), 0px 9px 28px rgba(0, 10, 6, 0.05), 0px 12px 48px 16px rgba(0, 10, 6, 0.03);">
      <div class="pb-4 mb-6" style="border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <div class="flex flex-row items-center justify-between">
          <span style="font-size: 20px;" class="mb-2">{{ t('registration_node') }}</span>
          <img
            class="cursor-pointer"
            style="opacity:0.65;"
            src="@/images/close.png"
            @click="hidenRegisterModal"
          >
        </div>
        <div>
          <span class="text-sm" style="color: rgba(255, 255, 255, 0.65);">{{ t('hold_nft_register_1') }}</span>
          <a
            class="text-xs ml-2"
            style="color: #D3B078;"
            href="https://permaswap.network/#/nft"
            target="_blank">{{ t('buy_nfts') }}</a>
        </div>
      </div>
      <ul class="text-xs mb-6" style="color: rgba(255, 255, 255, 0.65); list-style-type: disc;margin-left: 16px;">
        <li class="mb-2" style="color: #FFC53D;">
          {{ t('import_warn_1') }}
        </li>
        <li class="text-xs">
          {{ t('import_warn_2') }}
        </li>
      </ul>
      <div class="mb-6">
        <div class="mb-4">
          {{ t('select_format') }}
        </div>
        <div class="flex flex-row items-center justify-between">
          <div
            class="border-box pl-6 text-sm cursor-pointer"
            style="width: 196px;height: 38px;line-height:38px;background: #161e1b;border-radius: 8px;"
            :style="selectedFormat === 'Ethereum' ? 'color: #79D483;border: 1px solid #79D483;' : 'color: rgba(255, 255, 255, 0.65);border: 1px solid rgba(255, 255, 255, 0.65);'"
            @click="selectedFormat = 'Ethereum'"
          >
            Ethereum
          </div>
          <div
            class="border-box pl-6 text-sm cursor-pointer"
            style="width: 196px;height: 38px;line-height:38px;background: #161e1b;border-radius: 8px;"
            :style="selectedFormat === 'Arweave' ? 'color: #79D483;border: 1px solid #79D483;' : 'color: rgba(255, 255, 255, 0.65);border: 1px solid rgba(255, 255, 255, 0.65);'"
            @click="selectedFormat = 'Arweave'"
          >
            Arweave
          </div>
        </div>
      </div>
      <div class="mb-8">
        <div class="mb-4 flex flex-row items-center">
          <div>{{ t(selectedFormat === 'Ethereum' ? 'import_pk' : 'import_keyfile') }}</div>
          <div class="ml-2 relative flex flex-row items-center" @mouseover="importNoticeVisible = true" @mouseleave="importNoticeVisible = false">
            <img src="@/images/warning.png" class="cursor-pointer" style="width:13px;">
            <div
              v-if="importNoticeVisible"
              class="absolute border-box p-3 text-xs cursor-pointer"
              style="
                width:320px;
                background: #363F3B;
                box-shadow: 0px 1px 2px -2px rgba(0, 10, 6, 0.16), 0px 3px 6px rgba(0, 10, 6, 0.12), 0px 5px 12px 4px rgba(0, 10, 6, 0.09);
                border-radius: 12px;
                left: -30px;
                line-height:18px;
              "
              :style="locale === 'en' ? 'top:-180px;' : 'top:-110px;'"
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
          v-if="selectedFormat === 'Ethereum'"
          v-model="privateKey"
          class="privatekey-area p-3 block m-0"
          style="resize: none;width: 416px;height: 68px;background: #161e1b;border-radius: 12px;"
          placeholder="Please paste your private key" />
        <div
          v-if="selectedFormat === 'Arweave'"
          class="px-4 py-3 flex flex-row items-center border-box w-full cursor-pointer"
          style="background: #161E1B;border-radius: 12px;"
          @click="triggerFileInput"
        >
          <img
            v-if="jwkFileName"
            src="@/images/keyfile-green.png"
            class="mr-3"
            style="height:28px;">
          <img
            v-else
            src="@/images/keyfile.png"
            class="mr-3"
            style="height:28px;">
          <div>
            <div class="text-sm text-left" :style="jwkFileName ? 'rgba(255, 255, 255, 0.85);' : 'color: rgba(255, 255, 255, 0.45);'">
              {{ jwkFileName ? jwkFileName : 'Load Keyfile from system' }}
            </div>
            <div class="text-xs text-left" :style="jwkFileName ? 'rgba(255, 255, 255, 0.65);' : 'color: rgba(255, 255, 255, 0.3);'">
              Private key JSON file
            </div>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          style="position: fixed;top: -1em;left: -1em;width: 1px;height: 1px;opacity: 0"
          accept=".json,application/json"
          :multiple="false"
        >
        <span
          v-if="selectedFormat === 'Ethereum' && privateKey && !isPrivateKeyValid"
          style="color: #FF7D69;line-height:20px;"
          class="text-xs">
          {{ t('pk_notice') }}
        </span>
        <span
          v-if="selectedFormat === 'Arweave' && jwkFileName && !isJwkValid"
          style="color: #FF7D69;line-height:20px;"
          class="text-xs">
          {{ t('jwk_notice') }}
        </span>
      </div>
      <div class="flex flex-row items-center justify-between absolute" style="width:416px;bottom:32px;left:32px;">
        <div
          class="border-box cursor-pointer"
          style="border: 1px solid rgba(121, 212, 131, 0.25);color: #79D483;border-radius: 8px;width: 196px;height:48px;line-height:48px;text-align:center;"
          @click="hidenRegisterModal">
          {{ t('cancel') }}
        </div>
        <div
          :class="((selectedFormat === 'Ethereum' && isPrivateKeyValid) || (selectedFormat === 'Arweave' && isJwkValid)) ? 'primary-btn' : 'disable-btn'"
          style="border-radius: 8px;width: 196px;height:48px;line-height:48px;text-align:center;"
          @click="handleRegister">
          {{ t('import') }}
        </div>
      </div>
    </div>
  </div>
</template>
<style>
.el-upload {
  width: 100% !important;
}
</style>

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
