import { createSign, randomBytes, createVerify, createPublicKey, KeyObject } from 'crypto'
import axios, { AxiosRequestConfig } from 'axios'
import { IDouyinPayV2Config } from './douyin.interface'
import { ISignVerifyOptions, IOrderByOrderIdOptions, IOrderByOutOrderNoOptions } from './douyin-pay-v2.interface'

/**
 * 交易系统接入指引：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/open-capacity/trade-system/guide/general/basicapi
 *
 * 交易支付回调：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/trade-system/general/order/notify-payment-result
 * 交易支付拉起收银台：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/industry/general_trade/create_order/get-order-payment
 */

export class DouyinPayV2 {
  constructor(config: IDouyinPayV2Config) {
    const keys = ['appid', 'privateKey', 'publicKey', 'platformPublicKey', 'keyVersion']
    keys.forEach((key) => {
      if (!config[key]) {
        throw new Error(`${key} 参数不能为空`)
      }
      if (key === 'platformPublicKey') {
        this.platformPublicKey = createPublicKey({
          key: config.platformPublicKey,
          format: 'pem'
        })
      } else {
        this[key] = config[key]
      }
    })
  }

  // 域名配置
  readonly apiUrl: string = 'https://open.douyin.com'
  // 支付私钥
  private privateKey: Buffer
  // 支付公钥
  private publicKey: Buffer
  // 平台公钥
  private platformPublicKey: KeyObject
  // 小程序 appid
  private appid = ''
  // 应用公钥版本，每次重新上传公钥后需要更新，可通过「开发 - 开发设置 - 密钥设置」处获取
  private keyVersion = '1'

  async request(config: AxiosRequestConfig) {
    config.headers = config.headers || {}
    config.headers['Content-Type'] = 'application/json'
    // 拼接完整的请求地址
    config.url = this.apiUrl + config.url
    // 设置数据响应类型
    config.responseType = 'json'
    return await axios(config).then((res) => res.data)
  }

  /**
   * 生成指定长度的随机字符串
   * @param length 长度
   * @return
   */
  private randomCharacter(length = 8) {
    return randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length)
  }

  /**
   * 获取数据签名
   * @param data
   *
   * 签名逻辑
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/trade-system/general/order/request-order-data-sign#d54617e3
   *
   * 在线生成公钥和私钥
   * @link https://developer.open-douyin.com/docs/openapi-explorer/sign
   * @returns
   */
  getAuthorization(data: string) {
    // 请求时间戳
    const timestamp = Math.floor(Date.now() / 1000)
    // 随机字符串
    const nonce = this.randomCharacter(16)
    try {
      // 生成签名
      const rawData = `POST\n/requestOrder\n${timestamp}\n${nonce}\n${data}\n`
      const signature = createSign('SHA256').update(rawData).sign(this.privateKey, 'base64')
      // 构造 byteAuthorization
      return `SHA256-RSA2048 appid=${this.appid},nonce_str=${nonce},timestamp=${timestamp},key_version=${this.keyVersion},signature=${signature}`
    } catch (error) {
      console.error('Get Authorization Error')
      console.error(error)
      return ''
    }
  }

  /**
   * 验证回调签名
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/trade-system/general/order/notify-payment-result
   */
  signVerify({ timestamp, nonce, signature, body }: ISignVerifyOptions) {
    const message = `${timestamp}\n${nonce}\n${JSON.stringify(body)}\n`
    const verify = createVerify('SHA256').update(message)
    return verify.verify(this.platformPublicKey, Buffer.from(signature, 'base64'))
  }

  /**
   * 查询订单信息
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/trade-system/general/order/query-order
   */
  async orderByOrderId(options: IOrderByOrderIdOptions): Promise<Record<string, any>> {
    return await this.request({
      method: 'post',
      url: '/api/trade_basic/v1/developer/order_query/',
      data: { order_id: options.order_id },
      headers: {
        'access-token': options.access_token
      }
    })
  }

  /**
   * 查询订单信息
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/trade-system/general/order/query-order
   */
  async orderByOutOrderNo(options: IOrderByOutOrderNoOptions): Promise<Record<string, any>> {
    return await this.request({
      method: 'post',
      url: '/api/trade_basic/v1/developer/order_query/',
      data: { out_order_no: options.out_order_no },
      headers: {
        'access-token': options.access_token
      }
    })
  }
}
