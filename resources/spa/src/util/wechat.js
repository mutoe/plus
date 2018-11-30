/* global WeixinJSBridge */
import api from '@/api/api'
import { Promise } from 'core-js'

export const signinByWechat = () => {
  const redirectUrl = window.location.origin + process.env.BASE_URL + 'wechat/'
  api
    .post(
      'socialite/getOriginUrl',
      { redirectUrl },
      { validateStatus: s => s === 200 }
    )
    .then(({ data: { url = '' } = {} }) => {
      window.location.href = url
    })
}

export const wechatPay = payload => {
  return new Promise((resolve, reject) => {
    function onBridgeReady () {
      WeixinJSBridge.invoke('getBrandWCPayRequest', payload, res => {
        if (res.err_msg === 'get_brand_wcpay_request:ok') {
          resolve()
        } else if (res.err_msg === 'get_brand_wcpay_request:cancel') {
          reject('支付失败：取消支付')
        } else {
          // eslint-disable-next-line
          console.error(res.err_msg)
          reject('支付失败：请联系管理员')
        }
      })
    }
    if (typeof WeixinJSBridge === 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false)
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady)
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady)
      }
    } else {
      onBridgeReady()
    }
  })
}
