import { sendRequest } from 'everpay/esm/api'
import { isProd } from './swap'

const host = `https://auction${isProd ? '' : '-dev'}.permaswap.network`

export const getTradingInfo = async (): Promise<any> => {
  const url = `${host}/info`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}

export const getTradingStats = async (addr: string): Promise<any> => {
  const url = `${host}/stats?lp=${addr}`
  const result = await sendRequest({
    url,
    method: 'GET'
  })
  return result.data
}
