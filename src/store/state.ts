export interface State {
  account: string
  privateKey: string
  info: any
  downloadModalVisible: boolean
  accountModalVisible: boolean
  registerModalVisible: boolean
  addPoolModalVisible: boolean
  lps: any[]
  holderToNFTs: any
  whitelist: string[]
  manualConnect: boolean
  successConnect: boolean
}

export const defaultState = {
  account: '',
  privateKey: '',
  info: {},
  downloadModalVisible: false,
  accountModalVisible: false,
  registerModalVisible: false,
  addPoolModalVisible: false,
  lps: [],
  holderToNFTs: {},
  whitelist: [],
  manualConnect: false,
  successConnect: false
}
