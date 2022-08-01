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
