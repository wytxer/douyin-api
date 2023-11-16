import axios, { AxiosRequestConfig } from 'axios'

import { IStateResponse, IDouyinConfig } from './douyin.interface'
import {
  ICode2SessionResponse,
  IAccessTokenResponse,
  ICheckTextResponse,
  ICheckImageResponse,
  ISendOptions,
  ICheckTextOptions,
  ICheckImageOptions
} from './douyin-app.interface'

export class DouyinApp {
  constructor(readonly config: IDouyinConfig) {
    if (!config.appid) {
      throw new Error('appid 参数不能为空')
    }
    if (!config.secret) {
      throw new Error('secret 参数不能为空')
    }
    this.config = config
  }

  private readonly apiToutiao: string = 'https://developer.toutiao.com'
  private readonly apiDouyin: string = 'https://open.douyin.com'

  async request(config: AxiosRequestConfig) {
    config.url = (config.baseURL || this.apiToutiao) + config.url
    return await axios(config).then((res) => res.data)
  }

  /**
   * 登录凭证校验
   * @param code
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/log-in/code-2-session
   * @returns
   */
  async code2Session(code: string): Promise<ICode2SessionResponse> {
    const { appid, secret } = this.config
    const data = { appid, secret, code }

    return await this.request({
      method: 'post',
      url: '/api/apps/v2/jscode2session',
      data
    })
  }

  /**
   * 获取小程序全局唯一后台接口调用凭据
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/interface-request-credential/get-access-token/
   * @returns
   */
  async accessToken(): Promise<IAccessTokenResponse> {
    const { appid, secret } = this.config

    return await this.request({
      method: 'get',
      url: `/api/apps/v2/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    })
  }

  /**
   * 发送一次性订阅消息
   * @param options
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/subscribe-notification/notify/
   * @returns
   */
  async send(options: ISendOptions): Promise<IStateResponse> {
    return await this.request({
      method: 'post',
      url: '/api/apps/subscribe_notification/developer/v1/notify',
      data: options
    })
  }

  /**
   * 文本安全检测
   * @param options
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/content-security/content-security-detect
   * @returns
   */
  async checkText(options: ICheckTextOptions): Promise<ICheckTextResponse> {
    return await this.request({
      method: 'post',
      baseURL: this.apiDouyin,
      url: '/api/v2/tags/text/antidirt',
      data: options
    })
  }

  /**
   * 图片安全检测
   * @param options
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/content-security/picture-detect-v3
   * @returns
   */
  async checkImage(options: ICheckImageOptions): Promise<ICheckImageResponse> {
    return await this.request({
      method: 'post',
      baseURL: this.apiDouyin,
      url: '/api/apps/v1/censor/image',
      data: options
    })
  }
}
