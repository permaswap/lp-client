import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { InjectionKey } from 'vue'
import createPersistedState from 'vuex-persistedstate'
import { State, defaultState } from './state'

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
    updateAccountModalVisible (state, visible) {
      state.accountModalVisible = visible
    },
    updateRegisterModalVisible (state, visible) {
      state.registerModalVisible = visible
    },
    updateAddPoolModalVisible (state, visible) {
      state.addPoolModalVisible = visible
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
    }
  },

  getters: {

  },

  actions: {

  },

  modules: {},

  plugins: [createPersistedState()]
})

// define your own `useStore` composition function
export const useStore = function (): Store<State> {
  return baseUseStore(vuexStoreKey)
}
