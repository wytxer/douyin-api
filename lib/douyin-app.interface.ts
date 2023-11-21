import { IStateResponse } from './douyin.interface'

export interface ICode2SessionResponse extends IStateResponse {
  data: {
    openid: string
    session_key: string
    unionid?: string
    anonymous_openid?: string
  }
}

export interface IAccessTokenResponse extends IStateResponse {
  data: {
    access_token: string
    expires_in: number
  }
}

export interface ICheckTextResponse extends IStateResponse {
  log_id: string
  code: number
  msg: string
  data: any[]
  data_id: string
  task_id: string
  predicts: any[]
  target: string
  model_name: string
  prob: number
  hit: boolean
}

interface ICheckImageResponsePredict {
  model_name: string
  hit: boolean
}

export interface ICheckImageResponse extends IStateResponse {
  predicts: ICheckImageResponsePredict[]
}

export interface ISendParams {
  access_token: string
  app_id: string
  open_id: string
  tpl_id: string
  page: string
  data: Record<string, any>
}

interface ICheckTextTask {
  content: string
}

export interface ICheckTextParams {
  access_token: string
  tasks: ICheckTextTask[]
}

export interface ICheckImageParams {
  access_token: string
  app_id?: string
  image?: string
  image_data?: string
}
