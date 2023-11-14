import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { InjectionKey } from 'vue'
import createPersistedState from 'vuex-persistedstate'
import { State, defaultState } from './state'
import { getSwapInfo } from '@/lib/swap'

// define injection key
// eslint-disable-next-line symbol-description
export const vuexStoreKey: InjectionKey<Store<State>> = Symbol()

export default createStore<State>({
  state: defaultState,

  mutations: {
    updateAccount (state, account) {
      state.account = account
    },
    updatePrivateKey (state, privateKey) {
      state.privateKey = privateKey
    },
    updateInfo (state, info) {
      state.info = info
    },
    updateDownloadModalVisible (state, visible) {
      state.downloadModalVisible = visible
    },
    updatePenaltyModalVisible (state, visible) {
      state.penaltyModalVisible = visible
    },
    updateAccountModalVisible (state, visible) {
      state.accountModalVisible = visible
    },
    updateMiningModalVisible (state, visible) {
      state.miningModalVisible = visible
    },
    updateRegisterModalVisible (state, visible) {
      state.registerModalVisible = visible
    },
    updateAddPoolModalVisible (state, visible) {
      state.addPoolModalVisible = visible
    },
    updateDepositNoticeModalVisible (state, visible) {
      state.depositNoticeModalVisible = visible
    },
    updateDepositNoticeTokens (state, tokens) {
      state.depositNoticeTokens = tokens
    },
    updateHolderToNFTs (state, holderToNFTs: any) {
      if (holderToNFTs != null) {
        state.holderToNFTs = holderToNFTs
      } else {
        state.holderToNFTs = {}
      }
    },
    updateWhitelist (state, whitelist: string[]) {
      if (whitelist != null) {
        state.whitelist = whitelist
      } else {
        state.whitelist = []
      }
    },
    // 相同 lpId 只能有一个
    addLp (state, lp) {
      const foundIndex = state.lps.findIndex(l => l.lpId === lp.lpId)
      if (foundIndex !== -1) {
        state.lps.splice(foundIndex, 1)
      }
      state.lps.push(lp)
    },
    updateLp (state, lp) {
      const found = state.lps.find(l => l.lpId === lp.lpId)
      Object.assign(found, lp)
    },
    removeLp (state, lp) {
      const foundIndex = state.lps.findIndex(l => l.lpId === lp.lpId)
      state.lps.splice(foundIndex, 1)
    },
    clearLps (state) {
      state.lps = []
    },
    updateManualConnect (state, manualConnect) {
      state.manualConnect = manualConnect
    },
    updateSuccessConnect (state, successConnect) {
      state.successConnect = successConnect
    }
  },

  getters: {

  },

  actions: {
    async updateInfoAsync ({ commit }) {
      const info = await getSwapInfo()
      commit('updateInfo', info)
    }
  },

  modules: {},

  plugins: [createPersistedState()]
})

// define your own `useStore` composition function
export const useStore = function (): Store<State> {
  return baseUseStore(vuexStoreKey)
}
