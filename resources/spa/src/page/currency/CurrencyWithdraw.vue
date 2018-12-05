<template lang="html">
  <div class="p-currency-withdraw">
    <CommonHeader class="header">
      {{ currencyUnit }}提取
      <RouterLink slot="right" :to="{path: '/currency/detail', query: { action: 'cash' } }">
        提取记录
      </RouterLink>
    </CommonHeader>

    <section class="m-currency-panel">
      <h3>{{ currencyUnit }}兑换余额</h3>
      <p>100{{ currencyUnit }}=1.00元</p>
    </section>

    <main>
      <p>输入需提取的{{ currencyUnit }}</p>
      <p>提取{{ currencyUnit }}须提交官方审核，审核反馈请关注系统消息！</p>
      <div class="input-wrap">
        <input
          v-model="amount"
          :placeholder="`请至少提取${cashMin}${currencyUnit}`"
          type="number"
          oninput="value = value.slice(0,8)"
        >
      </div>

      <div class="m-lim-width" style="margin-top: 0.6rem">
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

    <footer>
      <p @click="popupRule">
        <svg class="m-style-svg m-svg-small">
          <use xlink:href="#icon-wallet-warning" />
        </svg>
        {{ currencyUnit }}提取规则
      </p>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CurrencyWithdraw',
  data () {
    return {
      amount: '',
      loading: false,
    }
  },
  computed: {
    ...mapState({
      currency: state => state.CONFIG.currency,
      user: 'CURRENTUSER',
    }),
    cash () {
      return this.currency.cash
    },
    cashMin () {
      return this.currency.settings['cash-min'] || 1
    },
    cashMax () {
      return this.currency.settings['cash-max'] || 10
    },
    rule () {
      const rule = this.currency.cash.rule || ''
      return rule.replace(/\n/g, '<br>')
    },
    disabled () {
      return this.amount < this.cashMin || this.amount > this.cashMax
    },
    currentCurrency () {
      return this.user.currency.sum || 0
    },
  },
  created () {
    if (!this.currency.cash.status) {
      this.$Message.error('未开启积分提取功能')
      this.goBack()
    }
  },
  methods: {
    async handleOk () {
      // 积分不足时前往充值
      if (this.amount > this.currentCurrency) {
        this.$Message.error(`${this.currencyUnit}不足，请充值`)
        return this.$router.push({ name: 'currencyRecharge' })
      }
      const { message } = await this.$store.dispatch('currency/requestWithdraw', this.amount)
      if (message) {
        this.$Message.success(message)
        this.goBack()
      }
    },
    selectWithdrawType () {
      const actions = []
      this.$bus.$emit('actionSheet', actions, '取消', '当前未支持任何提现方式')
    },
    popupRule () {
      this.$bus.$emit('popupDialog', {
        title: `${this.currencyUnit}提取规则`,
        content: this.rule,
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "./currency.less";

.p-currency-withdraw {
  .m-currency-panel p {
    font-size: 60px;
  }

  .m-entry {
    width: 100%;
    padding: 0 20px;
    background-color: #fff;
  }

  main {
    font-size: 26px;
    padding: 30px;
    line-height: 54px;
    color: #999;

    .input-wrap {
      height: 90px;
      background-color: #f4f5f5;
      border: solid 1px #dedede;
      margin-top: 30px;

      input {
        background-color: transparent;
        height: 100%;
        width: 100%;
        text-align: center;
        font-size: 30px;
      }
    }
  }
}
</style>
