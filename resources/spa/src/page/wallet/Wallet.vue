<template lang="html">
  <div class="p-wallet wallet">
    <CommonHeader class="header">
      钱包
      <RouterLink slot="left" to="/profile">
        <svg class="m-style-svg m-svg-def">
          <use xlink:href="#icon-back" />
        </svg>
      </RouterLink>
      <RouterLink
        slot="right"
        :to="{ path: 'detail' }"
        append
      >
        明细
      </RouterLink>
    </CommonHeader>

    <section class="m-wallet-panel">
      <h3>账户余额(元)</h3>
      <p>{{ balance }}</p>
    </section>

    <ul class="m-box-model m-entry-group padding">
      <RouterLink
        v-if="wallet.recharge.status"
        :to="{path: 'recharge'}"
        append
        tag="li"
        class="m-entry"
      >
        <svg class="m-style-svg m-svg-def m-entry-prepend">
          <use xlink:href="#icon-currency-recharge" />
        </svg>
        <span class="m-text-box m-flex-grow1">充值</span>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </RouterLink>
      <RouterLink
        v-if="wallet.cash.status"
        :to="{path: 'withdraw'}"
        append
        tag="li"
        class="m-entry"
      >
        <svg class="m-style-svg m-svg-def m-entry-prepend">
          <use xlink:href="#icon-profile-wallet" />
        </svg>
        <span class="m-text-box m-flex-grow1">提现</span>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </RouterLink>
    </ul>

    <ul v-if="allowTransformCurrency" class="m-box-model m-entry-group padding">
      <RouterLink
        :to="{path: '/currency/recharge'}"
        tag="li"
        class="m-entry"
      >
        <svg class="m-style-svg m-svg-def m-entry-prepend">
          <use xlink:href="#icon-currency-recharge" />
        </svg>
        <span class="m-text-box m-flex-grow1">{{ currencyUnit }}充值</span>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </RouterLink>
    </ul>

    <footer>
      <p @click="popupRule">
        <svg class="m-style-svg m-svg-small">
          <use xlink:href="#icon-wallet-warning" />
        </svg>
        充值提现规则
      </p>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Wallet',
  data () {
    return {}
  },
  computed: {
    ...mapState({
      wallet: state => state.CONFIG.wallet,
    }),
    goldName () {
      const {
        site: { gold_name: { name = '金币' } = {} } = {},
      } = this.$store.state.CONFIG
      return name
    },
    user () {
      return this.$store.state.CURRENTUSER
    },
    new_wallet () {
      return this.user.new_wallet || { balance: 0 }
    },
    balance () {
      const raito = this.wallet.ratio || 100
      return (this.new_wallet.balance / raito).toFixed(2)
    },
    rule () {
      const rule = this.wallet.rule || ''
      return rule.replace(/\n/g, '<br>')
    },
    allowTransformCurrency () {
      return this.wallet['transform-currency']
    },
  },
  mounted () {
    this.$store.dispatch('fetchUserInfo')

    const amount = this.$route.query.total_amount
    if (amount) {
      this.$Message.success(`充值成功${amount}元!`)
    }
  },
  methods: {
    popupRule () {
      this.$bus.$emit('popupDialog', {
        title: '充值提现规则',
        content: this.rule,
      })
    },
  },
}
</script>

<style lang="less" scoped>
@panel-color: @primary;

.header {
  background-color: @panel-color;
  color: #fff;
  border-bottom: none;
  a {
    color: inherit;
  }
}

.p-wallet {
  .entry__group:first-of-type {
    margin-top: 0;
  }
}
.m-wallet-panel {
  padding: 60px 30px;
  color: #fff;
  font-size: 28px;
  background-color: @panel-color;
  h3 {
    opacity: 0.7;
  }
  p {
    margin-top: 80px;
    font-size: 100px;
    letter-spacing: 2px;
  }
}
footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1rem;

  p {
    font-size: 26px;
    color: #999;
  }
}
</style>
