export interface State {
  account: string
  privateKey: string
  info: any
  downloadModalVisible: boolean
  accountModalVisible: boolean
  miningModalVisible: boolean
  registerModalVisible: boolean
  addPoolModalVisible: boolean
  penaltyModalVisible: boolean
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
  miningModalVisible: false,
  registerModalVisible: false,
  addPoolModalVisible: false,
  penaltyModalVisible: false,
  lps: [],
  holderToNFTs: {},
  whitelist: [],
  manualConnect: false,
  successConnect: false
}
