export interface IDouyinConfig {
  appid: string
  secret: string
}

export interface IStateResponse {
  err_no: string
  err_tips: string
}

export interface IDouyinPayConfig {
  appid: string
  salt: string
  token: string
  env: string
}
