export interface State {
  account: string
  privateKey: string
  accountModalVisible: boolean
  registerModalVisible: boolean
  addPoolModalVisible: boolean
}

export const defaultState = {
  // account: '0x71fd9230395e58d49D0E4b08F87524D5d004f4C3',
  account: '',
  privateKey: '',
  accountModalVisible: false,
  registerModalVisible: false,
  addPoolModalVisible: true
}
