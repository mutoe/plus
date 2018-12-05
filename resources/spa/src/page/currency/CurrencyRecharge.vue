<template>
  <div class="p-currency-recharge">
    <CommonHeader class="header">
      充值{{ currencyUnit }}
      <RouterLink slot="right" to="/currency/detail">
        充值记录
      </RouterLink>
    </CommonHeader>

    <section class="m-currency-panel">
      <h3>充值比率</h3>
      <p>1.0元={{ Number(rechargeRatio * 100).toFixed(1) }}{{ currencyUnit }}</p>
    </section>

    <main class="m-box-model m-aln-center m-justify-center">
      <div class="m-box-model m-lim-width m-main">
        <div v-if="rechargeItems.length" class="m-pinned-amount-btns m-bb1">
          <p class="m-pinned-amount-label">选择充值金额</p>
          <div class="buttons">
            <button
              v-for="item in rechargeItems"
              :key="item"
              :class="{ active: (amount === item) && !customAmount }"
              class="m-pinned-amount-btn"
              @click="chooseDefaultAmount(item)"
              v-text="item.toFixed(2)"
            />
          </div>
        </div>
        <div class="m-box m-aln-center m-justify-bet m-pinned-row plr20 m-pinned-amount-customize">
          <span>自定义金额</span>
          <div class="m-box m-aln-center">
            <input
              v-model.number="customAmount"
              type="number"
              class="m-text-r"
              pattern="[0-9]*"
              placeholder="输入金额"
              oninput="value=value.slice(0,8)"
            >
            <span>元</span>
          </div>
        </div>
      </div>

      <div class="m-entry" @click="selectRechargeType">
        <span class="m-text-box m-flex-grow1">选择充值方式</span>
        <div class="m-box m-aln-end paid-type">{{ rechargeTypeText }}</div>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </div>

      <div class="plr20 m-lim-width submit-btn-wrap" style="margin-top: 0.6rem">
        <button
          :disabled="disabled || loading"
          class="m-long-btn m-signin-btn"
          @click="beforeSubmit"
        >
          <CircleLoading v-if="loading" />
          <span v-else>确定</span>
        </button>
      </div>

      <footer>
        <p @click="popupRule">
          <svg class="m-style-svg m-svg-small">
            <use xlink:href="#icon-wallet-warning" />
          </svg>
          用户充值协议
        </p>
      </footer>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as api from '@/api/currency'
import { wechatPay } from '@/util/wechat'

const supportTypes = [
  { key: 'alipay_wap', title: '支付宝支付', type: 'AlipayWapOrder' },
  { key: 'wx_wap', title: '微信支付', type: 'WechatWapOrder' },
  { key: 'balance', title: '钱包余额支付', type: 'balance' },
]

export default {
  name: 'CurrencyRecharge',
  data () {
    return {
      customAmount: null,
      amount: 0,
      rechargeType: '',
      loading: false,
    }
  },
  computed: {
    ...mapState({
      currency: state => state.CONFIG.currency,
      wallet: state => state.CONFIG.wallet,
    }),
    allowTransformCurrency () {
      return this.wallet['transform-currency']
    },
    isWechat () {
      return this.$store.state.BROWSER.isWechat
    },
    recharge () {
      return this.currency.recharge
    },
    rechargeRatio () {
      return this.currency.settings['recharge-ratio'] || 1
    },
    rechargeItems () {
      const items = (this.currency.settings['recharge-options'] || '').split(',')
      return items.map(item => Number(item) / 100)
    },
    allowedTypes () {
      return this.wallet.recharge.types || []
    },
    rule () {
      const rule = this.recharge.rule || ''
      return rule.replace(/\n/g, '<br>')
    },
    rechargeTypeText () {
      const type = supportTypes.filter(t => t.type === this.form.type).pop()
      return type && type.title
    },
    form () {
      return {
        amount: (this.customAmount || this.amount) * this.rechargeRatio * 100,
        type: this.rechargeType,
      }
    },
    disabled () {
      return !this.form.amount || !this.rechargeType
    },
  },
  watch: {
    rechargeItems (val) {
      if (!this.amount && val.length) this.amount = val[0]
    },
  },
  created () {
    if (!this.currency.recharge.status) {
      this.$Message.error('未开启提现功能')
      this.goBack()
      return
    }
    this.whenPayPending()
  },
  methods: {
    whenPayPending () {
      // TODO: 可以改为轮询效果更佳
      const lastPayTime = this.$lstore.getData('H5_WECHAT_PAY_PENDING')
      if (+new Date() - lastPayTime > 5 * 60 * 1000) return // 5min
      this.$lstore.removeData('H5_WECHAT_PAY_PENDING')
      const actions = [
        {
          text: '我已完成支付',
          color: '#28b350',
          method: () => void this.checkPaid(),
        },
        {
          text: '支付遇到问题',
          method: () => void this.$Message.error('如遇到问题请联系管理员'),
        },
      ]
      this.$bus.$emit('actionSheet', actions, '返回')
    },
    checkPaid () {
      const order = this.$lstore.getData('H5_WECHAT_PAY_ORDER')
      if (!order) return this.$Message.error('查询订单失败')
      api.checkWechatOrders(order)
        .then(res => {
          this.$lstore.removeData('H5_WECHAT_PAY_ORDER')
          if (res.data.message === '充值成功') {
            this.$Message.success('充值成功')
            this.$router.replace('/currency')
            return
          }
          this.$Message.error('支付失败，请重新下单')
        })
    },
    chooseDefaultAmount (amount) {
      this.customAmount && (this.customAmount = null)
      this.amount = amount
    },
    selectRechargeType () {
      const actions = []
      if (this.allowTransformCurrency) {
        actions.push({
          text: '钱包余额支付',
          method: () => void (this.rechargeType = 'balance'),
        })
      }
      supportTypes.forEach(item => {
        if (this.allowedTypes.includes(item.key)) {
          actions.push({
            text: item.title,
            method: () => void (this.rechargeType = item.type),
          })
        }
      })
      this.$bus.$emit(
        'actionSheet',
        actions,
        '取消',
        actions.length ? undefined : '当前未支持任何充值方式'
      )
    },
    beforeSubmit () {
      if (this.loading) return
      const { amount, type } = this.form
      if (amount < this.recharge.min) { return this.$Message.error(`最低只能充值${this.recharge.min / 100}元`) }
      if (amount > this.recharge.max) { return this.$Message.error(`最多只能充值${this.recharge.max / 100}元`) }

      if (type === 'balance') {
        this.rechargeWithBanlance(amount)
      } else {
        this.rechargeWithPay(type, amount)
      }
    },
    async rechargeWithBanlance (amount) {
      this.loading = true
      const result = await this.$store.dispatch('currency/currency2wallet', amount)
      this.loading = false
      if (!result.errors) {
        this.$Message.success('充值成功！')
        this.goBack()
        this.$store.dispatch('fetchUserInfo')
      } else {
        this.$Message.error(result.errors)
      }
    },
    async rechargeWithPay (type, amount) {
      this.loading = true
      const params = {
        amount,
        redirect: `${window.location.origin}${process.env.BASE_URL}currency`, // 支付成功后回调地址
        type,
      }
      if (type === 'WechatWapOrder') {
        if (this.isWechat) {
          params.type = 'WechatJsOrder'
          params.openId = this.$lstore.getData('H5_WECHAT_MP_OPENID')
        } else {
          params.wechat_type = 'WechatPay_Mweb'
        }
      }
      api.postCurrencyRecharge(params)
        .then(({ data }) => {
          if (params.type === 'WechatJsOrder') {
            // 如果是微信内支付 调用微信内置对象方法
            wechatPay(data.data)
              .then(() => {
                this.$Message.success('支付成功')
                this.$router.push('/currency')
              })
              .catch(err => {
                this.$Message.error(err)
              })
          } else if (params.type === 'WechatWapOrder') {
            this.$lstore.setData('H5_WECHAT_PAY_PENDING', +new Date())
            this.$lstore.setData('H5_WECHAT_PAY_ORDER', data.data.out_trade_no)
            location.href = data.data.mweb_url
          } else {
            // 支付宝返回的data为url, 直接跳转过去
            location.href = data
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    popupRule () {
      this.$bus.$emit('popupDialog', {
        title: '用户充值协议',
        content: this.rule,
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "./currency.less";

.p-currency-recharge {
  .m-currency-panel p {
    font-size: 60px;
  }
  .m-pinned-amount-btns {
    padding-bottom: 0;
    .buttons {
      display: flex;
      flex-wrap: wrap;

      > button {
        margin: 0 20px 30px;
        width: calc(~"33% - 40px");
      }
    }
  }
  .paid-type {
    font-size: 30px;
    color: #999;
  }
  .submit-btn-wrap {
    margin-bottom: 90px;
  }
  .m-entry {
    line-height: 1;
    width: 100%;
    padding: 0 20px;
    background-color: #fff;
    margin-top: 20px;
  }
}
</style>
