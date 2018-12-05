<template lang="html">
  <div class="p-wallet-withdraw">
    <CommonHeader>
      提现
      <RouterLink
        slot="right"
        class="withdraw-detail"
        to="/wallet/withdraw/detail"
      >
        提现明细
      </RouterLink>
    </CommonHeader>

    <main class="m-box-model m-aln-center m-justify-center">
      <div class="m-box-model m-lim-width m-main">
        <div class="m-box m-aln-center m-justify-bet m-bb1 m-bt1 m-pinned-row plr20 m-pinned-amount-customize">
          <span>提现金额</span>
          <div class="m-box m-aln-center">
            <input
              v-model.number="amount"
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

      <div class="m-entry" @click="selectWithdrawType">
        <span class="m-text-box m-flex-grow1">选择提现方式</span>
        <div class="m-box m-aln-end paid-type">{{ withdrawTypeText }}</div>
        <svg class="m-style-svg m-svg-def">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </div>

      <div class="m-box-model m-lim-width m-main">
        <div class="m-box m-aln-center m-justify-bet m-bb1 m-bt1 m-pinned-row plr20 m-pinned-amount-customize">
          <span>提现账户</span>
          <div class="m-box m-aln-center">
            <input
              v-model="account"
              type="text"
              class="m-text-r"
              placeholder="输入提现账户"
            >
          </div>
        </div>
      </div>

      <div class="plr20 m-lim-width" style="margin-top: 0.6rem">
        <button
          :disabled="disabled || loading"
          class="m-long-btn m-signin-btn"
          @click="handleOk"
        >
          <CircleLoading v-if="loading" />
          <span v-else>确定</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as api from '@/api/wallet'

const supportType = {
  alipay: { title: '支付宝提现', type: 'alipay' },
  wechat: { title: '微信提现', type: 'wechat' },
}

export default {
  name: 'WalletWithdraw',
  data () {
    return {
      amount: '',
      account: '',
      selectedType: '',
      loading: false,
    }
  },
  computed: {
    ...mapState({
      wallet: state => state.CONFIG.wallet || {},
    }),
    disabled () {
      const { value, account, type } = this.form
      return !value || !account || !type
    },
    form () {
      const selectedType = supportType[this.selectedType] || {}
      return {
        value: this.amount * 100,
        type: selectedType.type,
        account: this.account,
      }
    },
    withdrawTypeText () {
      const selectedType = supportType[this.selectedType] || {}
      return selectedType.title
    },
    walletType () {
      return this.wallet.cash.types || []
    },
  },
  created () {
    if (!this.wallet.cash.status) {
      this.$Message.error('未开启提现功能')
      this.goBack()
    }
  },
  methods: {
    handleOk () {
      if (this.loading) return
      this.loading = true
      api.postWalletWithdraw(this.form)
        .then(({ data }) => {
          this.$Message.success(data.message)
          this.$router.replace('/wallet/withdraw/detail')
        })
        .finally(() => {
          this.loading = false
        })
    },
    selectWithdrawType () {
      const actions = []
      for (let key in supportType) {
        const type = supportType[key]
        if (this.walletType.includes(key)) {
          actions.push({
            text: type.title,
            method: () => {
              this.selectedType = key
            },
          })
        }
      }

      this.$bus.$emit(
        'actionSheet',
        actions,
        '取消',
        actions.length ? undefined : '当前未支持任何提现方式'
      )
    },
  },
}
</script>

<style lang="less" scoped>
.m-entry {
  width: 100%;
  padding: 0 20px;
  background-color: #fff;
}

.paid-type {
  font-size: 30px;
  color: #999;
}

.withdraw-detail {
  width: 5em;
  text-align: right;
}
</style>
