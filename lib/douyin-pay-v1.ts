import { createHash } from 'crypto'
import axios, { AxiosRequestConfig } from 'axios'

import { IDouyinPayV1Config } from './douyin.interface'
import { IPayInfoByOutOrderNoOptions } from './douyin-pay-v1.interface'

/**
 * 担保交易支付
 * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/ecpay/pay-list/pay
 * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/open-interface/pay/tt-pay
 *
 * 订单同步
 * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/ecpay/order/order-sync/
 */

export class DouyinPayV1 {
  constructor(config: IDouyinPayV1Config) {
    const keys = ['appid', 'salt', 'token', 'env']
    keys.forEach((key) => {
      if (!config[key]) {
        throw new Error(`${key} 参数不能为空`)
      }
      this[key] = config[key]
    })
  }

  // 域名配置
  readonly apiUrl: string = 'https://developer.toutiao.com'
  readonly sandboxApiUrl: string = 'https://open-sandbox.douyin.com'
  readonly orderSyncApiUrl = 'https://developer.toutiao.com'

  // 担保支付请求不参与签名参数
  readonly requestNotNeedSignParams = ['app_id', 'thirdparty_id', 'sign', 'other_settle_params']
  // 支付密钥
  private salt = ''
  // 支付 token
  private token = ''
  // 支付环境
  private env = 'online'
  // 小程序 appid
  private appid = ''

  async request(config: AxiosRequestConfig) {
    config.headers = config.headers || {}
    config.headers['Content-Type'] = 'application/json'
    // 拼接完整的请求地址
    if (config.baseURL) {
      config.url = config.baseURL + config.url
    } else {
      config.url = (this.env === 'online' ? this.apiUrl : this.sandboxApiUrl) + config.url
    }
    // 设置数据响应类型
    config.responseType = 'json'
    return await axios(config).then((res) => res.data)
  }

  /**
   * 字符串转 MD5
   * @returns
   */
  private toMd5(dataString: string): string {
    return createHash('md5').update(dataString, 'utf8').digest('hex')
  }

  /**
   * 担保支付请求签名算法
   * @returns
   */
  requestSign(options: Record<string, any>): string {
    const params: string[] = []
    for (const [key, value] of Object.entries(options)) {
      if (this.requestNotNeedSignParams.includes(key)) {
        continue
      }
      let strValue = String(value).trim()
      if (strValue.startsWith('"') && strValue.endsWith('"') && strValue.length > 1) {
        strValue = strValue.slice(1, -1).trim()
      }
      if (strValue === '' || strValue === 'null') {
        continue
      }
      params.push(strValue)
    }
    params.push(this.salt)
    params.sort()
    const signStr = params.join('&')
    return this.toMd5(signStr)
  }

  /**
   * 担保支付回调签名算法
   * @returns
   */
  callbackSign(options: Record<string, any>): boolean {
    try {
      const concat = [this.token, options.timestamp, options.msg, options.nonce].sort().join('')
      const hash = createHash('sha1').update(concat, 'utf8').digest('hex')
      return hash === options.msg_signature
    } catch (err) {
      return false
    }
  }

  /**
   * 预下单
   * @description
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/ecpay/pay-list/pay
   * @returns
   */
  async prepay(options: Record<string, any>): Promise<Record<string, any>> {
    return await this.request({
      method: 'post',
      url: '/api/apps/ecpay/v1/create_order',
      data: options
    })
  }

  /**
   * 查询订单
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/ecpay/pay-list/query/
   */
  async payInfoByOutOrderNo(options: IPayInfoByOutOrderNoOptions): Promise<Record<string, any>> {
    return await this.request({
      method: 'get',
      url: '/api/apps/ecpay/v1/query_order',
      data: options
    })
  }

  /**
   * 订单同步
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/ecpay/order/order-sync/
   */
  async orderSync(options: Record<string, any>): Promise<Record<string, any>> {
    return await this.request({
      method: 'post',
      url: '/api/apps/order/v2/push',
      data: options,
      baseURL: this.orderSyncApiUrl
    })
  }
}
