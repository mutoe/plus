<template lang="html">
  <div class="p-currency">
    <CommonHeader class="header">
      我的{{ currencyUnit }}
      <RouterLink slot="left" to="/profile">
        <svg class="m-style-svg m-svg-def">
          <use xlink:href="#icon-back" />
        </svg>
      </RouterLink>
      <RouterLink
        slot="right"
        to="/currency/journal-detail"
      >
        明细
      </RouterLink>
    </CommonHeader>

    <section class="m-currency-panel">
      <h3>当前{{ currencyUnit }}</h3>
      <p>{{ user.currency.sum || 0 }}</p>
    </section>

    <ul class="m-box-model m-entry-group padding">
      <RouterLink
        v-if="currency.recharge.status"
        to="/currency/recharge"
        tag="li"
        class="m-entry"
      >
        <svg class="m-style-svg m-svg-def m-entry-prepend">
          <use xlink:href="#icon-currency-recharge" />
        </svg>
        <span class="m-text-box m-flex-grow1">充值{{ currencyUnit }}</span>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </RouterLink>
      <RouterLink
        v-if="currency.cash.status"
        to="/currency/withdraw"
        tag="li"
        class="m-entry"
      >
        <svg class="m-style-svg m-svg-def m-entry-prepend">
          <use xlink:href="#icon-profile-wallet" />
        </svg>
        <span class="m-text-box m-flex-grow1">提取{{ currencyUnit }}</span>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </RouterLink>
    </ul>

    <DetailAd type="currency" />

    <footer>
      <p @click="showRule">
        <svg class="m-style-svg m-svg-small">
          <use xlink:href="#icon-wallet-warning" />
        </svg>
        {{ currencyUnit }}规则
      </p>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DetailAd from '@/components/advertisement/DetailAd.vue'

export default {
  name: 'Currency',
  components: { DetailAd },
  data () {
    return {
      fromPageTitle: '',
    }
  },
  computed: {
    ...mapState({
      user: 'CURRENTUSER',
      currency: state => state.CONFIG.currency,
    }),
    rule () {
      const rule = this.currency.rule || ''
      return rule.replace(/\n/g, '<br>')
    },
  },
  created () {
    this.fromPageTitle = document.title
    document.title = this.currencyUnit
  },
  mounted () {
    this.$store.dispatch('fetchUserInfo')

    const amount = this.$route.query.total_amount
    if (amount) {
      this.$Message.success(
        `充值成功, 获得 ${amount * 100} ${this.currencyUnit}!`
      )
    }
  },
  destroyed () {
    document.title = this.fromPageTitle
  },
  methods: {
    showRule () {
      this.$bus.$emit('popupDialog', {
        title: `${this.currencyUnit}规则`,
        content: this.rule,
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "./currency.less";
</style>
