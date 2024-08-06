/**
 * 签名验证参数
 */
export interface ISignVerifyOptions {
  timestamp: string
  nonce: string
  signature: string
  body: any
}

/**
 * 查询订单详情参数
 */
export interface IOrderByOrderIdOptions {
  order_id: string
  access_token: string
}

export interface IOrderByOutOrderNoOptions {
  out_order_no: string
  access_token: string
}
