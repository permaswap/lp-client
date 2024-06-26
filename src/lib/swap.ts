import { sendRequest } from 'everpay/esm/api'
import { ethers } from 'ethers'
import redstone from 'redstone-api'
import hashPersonalMessage from 'everpay/esm/lib/hashPersonalMessage'
import { formatInputPrecision, toBN } from './util'

export interface CurrencyPriceItem {
  symbol: string
  price: string
}

export const isProd = true

const host = isProd ? 'router.permaswap.network' : 'router-dev.permaswap.network'

export const getMarketPrices = async (currency: string, symbols: string[]): Promise<CurrencyPriceItem[]> => {
  const priceStack = await redstone.getPrice(symbols)
  return symbols.map(symbol => {
    return {
      symbol,
      price: priceStack[symbol] != null ? priceStack[symbol].value.toString() : '0'
    }
  })
}

let socket = null as any

export const getTxsByCursor = async (account: string, cursor: number): Promise<any[]> => {
  const url = `https://api${isProd ? '' : '-dev'}.everpay.io/txs/${account}?cursor=${cursor}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data.txs
}

export const getTotalTxsByCursor = async (account: string, cursor: number): Promise<any[]> => {
  let lastCursor = cursor
  let txs = await getTxsByCursor(account, lastCursor)
  let totalTxs = txs
  while (txs.length > 0) {
    lastCursor = txs[0].rawId
    txs = await getTxsByCursor(account, lastCursor)
    totalTxs = totalTxs.concat(txs)
  }
  return totalTxs
}

export const getNfts = async (): Promise<any> => {
  const url = `https://${host}/nft`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getSwapInfo = async (): Promise<string[]> => {
  const url = `https://${host}/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getPoolPrice = async (poolId: string): Promise<string> => {
  const url = `https://${host}/pool/${poolId}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return formatInputPrecision(toBN(result.data.currentPriceDown).toString(), 8)
}

export const getLpReward = async (lpId: string): Promise<any> => {
  const url = `https://${host}/lpreward?lpid=${lpId}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  const reward = result.data.rewards[0]
  return reward
}

export const getStats = async (account: string): Promise<any> => {
  const url = `https://${host}/stats?accid=${account}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getAggregate = async (account: string): Promise<any> => {
  const url = `https://stats${isProd ? '' : '-dev'}.permaswap.network/aggregate?accid=${account}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getMiningInfo = async (): Promise<any> => {
  const url = `https://mining${isProd ? '' : '-dev'}.permaswap.network/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getPenalty = async (): Promise<any> => {
  const url = `https://${host}/penalty`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getPoolIdVolumeData = async (poolId: string): Promise<any> => {
  const url = `https://${host}/stats?poolid=${poolId}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getLiquidityMingInfo = async (contractId: string): Promise<any> => {
  const url = `https://${host}/halo/proposal/${contractId}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const defaultSwapRouterAddress = isProd ? '0xD110107aDb30BCe6C0646EAF77cC1C815012331d' : '0x1DF611aec4065801f416c67d2c3bC9466228Ea57'
export const getNodeHaloInfo = async (): Promise<any> => {
  const url = `https://${host}/halo/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  result.data.routerState[defaultSwapRouterAddress] = {
    ...result.data.routerState[defaultSwapRouterAddress],
    name: 'Permaswap',
    domain: host,
    ip: ''
  }
  const routers = result.data.routers.filter((key: string) => {
    const routerState: any = result.data.routerState[key]
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (routerState.ip) {
      routerState.pools = {}
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return routerState && (routerState.domain || routerState.ip)
  })
  result.data.routers = routers
  return result.data
}

export interface InitSocketParams {
  handleError: any
  handleSalt: any
  handleOrder: any
  handleOpen: any
  handleStatus: any
}

export const initSocket = (params: InitSocketParams): void => {
  socket = new WebSocket(`wss://${host}/wslp`)
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
    } else if (data.event === 'status') {
      if (params.handleStatus != null) {
        params.handleStatus(data)
      }
    }
  })
  socket.addEventListener('open', params.handleOpen)
  return socket
}

interface SendRegisterParams {
  lpClientVerison: string
  lpClientName: string
  address: string
  sig: string
}

export const closeSocket = (): void => {
  if (socket != null) {
    socket.close()
  }
}

export const sendRegister = (params: SendRegisterParams): void => {
  const { sig, address, lpClientName, lpClientVerison } = params
  const data = {
    event: 'register',
    address: address,
    lpClientName,
    lpClientVerison,
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
  console.log(22222)
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
    'Address:' + (address.startsWith('0x') ? ethers.utils.getAddress(address) : address) + '\n' +
    'LowSqrtPrice:' + jsonConfig.lowSqrtPrice.toString() + '\n' +
    'HighSqrtPrice:' + jsonConfig.highSqrtPrice.toString() + '\n' +
    'PriceDirection:' + jsonConfig.priceDirection
  console.log('msg', msg)
  const lpId = uint8ArrayToHex(hashPersonalMessage(Buffer.from(msg)))
  console.log('lpId', lpId)
  return lpId
}

export const getOrderHash = (bundle: any): string => {
  const orderHash = uint8ArrayToHex(hashPersonalMessage(Buffer.from(JSON.stringify(bundle))))
  return orderHash
}
