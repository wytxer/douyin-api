export interface IDouyinConfig {
  appid: string
  secret: string
}

export interface IStateResponse {
  err_no: string
  err_tips: string
}

export interface IDouyinPayV1Config {
  appid: string
  salt: string
  token: string
  env: string
}

export interface IDouyinPayV2Config {
  appid: string
  privateKey: Buffer
  publicKey: Buffer
  platformPublicKey: Buffer
  keyVersion: string
}
