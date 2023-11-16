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
  mchid: string
  publicKey: Buffer
  privateKey: Buffer
  secret: string
}
