import { sendRequest } from 'everpay/esm/api'
import { ethers } from 'ethers'
import hashPersonalMessage from 'everpay/esm/lib/hashPersonalMessage'

let socket = null as any

export const getSwapInfo = async (): Promise<string[]> => {
  const url = 'https://router0-dev.permaswap.network/info'
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export interface InitSocketParams {
  handleError: any
  handleSalt: any
  handleOrder: any
  handleOpen: any
}

export const initSocket = (params: InitSocketParams): void => {
  if (socket == null) {
    socket = new WebSocket('wss://router0-dev.permaswap.network/wslp')
  }
  socket.addEventListener('message', (message: any) => {
    console.log(11111, message.data)
    const data = JSON.parse(message.data)
    if (data.event === 'order') {
      if (params.handleOrder != null) {
        params.handleOrder(data)
      }
    } else if (data.event === 'salt') {
      if (params.handleSalt != null) {
        params.handleSalt(data)
      }
    } else if (data.event === 'error') {
      if (params.handleError != null) {
        params.handleError(data)
      }
    }
  })
  socket.addEventListener('open', params.handleOpen)
}

interface SendRegisterParams {
  address: string
  sig: string
}

export const sendRegister = (params: SendRegisterParams): void => {
  const { sig, address } = params
  const data = {
    event: 'register',
    address: address,
    sig
  }
  console.log('data', data)
  socket.send(JSON.stringify(data))
}

interface SendAddParams {
  tokenX: string
  tokenY: string
  feeRatio: string
  currentSqrtPrice: string
  lowSqrtPrice: string
  highSqrtPrice: string
  liquidity: string
  priceDirection: string
}

export const sendAdd = (params: SendAddParams): void => {
  const data = {
    event: 'add',
    ...params
  }
  console.log('data', data)
  socket.send(JSON.stringify(data))
}

interface SendRemoveParams {
  tokenX: string
  tokenY: string
  feeRatio: string
  lowSqrtPrice: string
  highSqrtPrice: string
  priceDirection: string
}

export const sendRemove = (params: SendRemoveParams): void => {
  const data = {
    event: 'remove',
    ...params
  }
  console.log('data', data)
  socket.send(JSON.stringify(data))
}

interface SendSignParams {
  address: string
  bundle: any
}

export const sendSign = (params: SendSignParams): void => {
  const data = {
    event: 'sign',
    ...params
  }
  console.log('data', data)
  socket.send(JSON.stringify(data))
}

const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return '0x' + [...uint8Array].map((b) => {
    return b.toString(16).padStart(2, '0')
  }).join('')
}

export const getLpId = (poolId: string, address: string, jsonConfig: any): string => {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  const msg = 'PoolID:' + poolId + '\n' +
  // 需要 checksum 地址
    'Address:' + ethers.utils.getAddress(address) + '\n' +
    'LowSqrtPrice:' + jsonConfig.lowSqrtPrice.toString() + '\n' +
    'HighSqrtPrice:' + jsonConfig.highSqrtPrice.toString() + '\n' +
    'PriceDirection:' + jsonConfig.priceDirection
  console.log('msg', msg)
  const lpId = uint8ArrayToHex(hashPersonalMessage(Buffer.from(msg)))
  console.log('lpId', lpId)
  return lpId
}
