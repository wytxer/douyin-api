import axios, { AxiosRequestConfig } from 'axios'

import { IStateResponse, IDouyinConfig } from './douyin.interface'
import {
  ICode2SessionResponse,
  IAccessTokenResponse,
  ICheckTextResponse,
  ICheckImageResponse,
  ISendParams,
  ICheckTextParams,
  ICheckImageParams
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
    return await this.request({
      method: 'post',
      url: '/api/apps/v2/jscode2session',
      data: {
        appid,
        secret,
        code
      }
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
      method: 'post',
      url: '/api/apps/v2/token',
      data: {
        appid,
        secret,
        grant_type: 'client_credential'
      }
    })
  }

  /**
   * 获取小程序全局唯一后台接口调用凭据（不需要用户授权）
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/interface-request-credential/non-user-authorization/get-client_token
   * @returns
   */
  async clientToken(): Promise<IAccessTokenResponse> {
    const { appid, secret } = this.config
    return await this.request({
      baseURL: this.apiDouyin,
      method: 'post',
      url: '/oauth/client_token',
      data: {
        appid,
        secret,
        grant_type: 'client_credential'
      }
    })
  }

  /**
   * 发送一次性订阅消息
   * @param params
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/subscribe-notification/notify/
   * @returns
   */
  async send(params: ISendParams): Promise<IStateResponse> {
    return await this.request({
      method: 'post',
      url: '/api/apps/subscribe_notification/developer/v1/notify',
      data: params
    })
  }

  /**
   * 文本安全检测
   * @param params
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/content-security/content-security-detect
   * @returns
   */
  async checkText(params: ICheckTextParams): Promise<ICheckTextResponse> {
    const { access_token, tasks } = params
    return await this.request({
      method: 'post',
      url: '/api/v2/tags/text/antidirt',
      data: { tasks },
      headers: {
        'X-Token': access_token
      }
    })
  }

  /**
   * 图片安全检测
   * @param params
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/content-security/picture-detect-v2
   * @returns
   */
  async checkImageV2(params: ICheckImageParams): Promise<ICheckImageResponse> {
    const { access_token, app_id, image, image_data } = params
    return await this.request({
      method: 'post',
      url: '/api/apps/censor/image',
      data: { access_token, app_id, image, image_data }
    })
  }

  /**
   * 图片安全检测
   * @param params
   * @link https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/content-security/picture-detect-v3
   * @returns
   */
  async checkImageV3(params: ICheckImageParams): Promise<ICheckImageResponse> {
    const { access_token, app_id, image, image_data } = params
    return await this.request({
      baseURL: this.apiDouyin,
      method: 'post',
      url: '/api/apps/v1/censor/image',
      data: { app_id, image, image_data },
      headers: {
        'access-token': access_token
      }
    })
  }
}
