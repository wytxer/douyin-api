import { IDouyinPayConfig } from './douyin.interface'

// todo 新增交易系统接口

/**
 * 交易系统接入指引：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/open-capacity/trade-system/guide/general/basicapi
 *
 * 交易支付回调：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/trade-system/general/order/notify-payment-result
 * 交易支付拉起收银台：https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/api/industry/general_trade/create_order/get-order-payment
 */

export class DouyinPayV2 {
  constructor(config: IDouyinPayConfig) {
    const keys = ['appid', 'privateKey']
    keys.forEach((key) => {
      if (!config[key]) {
        throw new Error(`${key} 参数不能为空`)
      }
      this[key] = config[key]
    })
  }
}
