export interface State {
  account: string
  privateKey: string
  accountModalVisible: boolean
  registerModalVisible: boolean
  addPoolModalVisible: boolean
  lps: any[]
  holderToNFTs: any
}

export const defaultState = {
  account: '',
  privateKey: '',
  accountModalVisible: false,
  registerModalVisible: false,
  addPoolModalVisible: false,
  lps: [],
  holderToNFTs: {}
}
