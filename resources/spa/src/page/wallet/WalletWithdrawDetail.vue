<template lang="html">
  <div class="wallet-detail p-wallet-detail">
    <CommonHeader class="header"> 提现明细 </CommonHeader>

    <LoadMore
      ref="loadmore"
      :on-refresh="onRefresh"
      :on-load-more="onLoadMore"
      class="m-wallet-list"
    >
      <WalletWithdrawDetailItem
        v-for="item in list"
        v-if="item.id"
        :key="item.id"
        :detail="item"
        @click="showDetail(item.id)"
      />
    </LoadMore>
  </div>
</template>

<script>
import _ from 'lodash'
import WalletWithdrawDetailItem from './components/WalletWithdrawDetailItem.vue'

export default {
  name: 'WalletWithdrawDetail',
  components: { WalletWithdrawDetailItem },
  data () {
    return {
      currAction: 'out',
      list: [],
    }
  },
  computed: {
    after () {
      const len = this.list.length
      return len ? this.list[len - 1].id : 0
    },
  },
  watch: {
    currAction () {
      this.list = []
      this.$refs.loadmore.beforeRefresh()
    },
  },
  methods: {
    showDetail (id) {
      this.$router.push({ path: `/wallet/withdraw/detail/${id}` })
    },
    async onRefresh () {
      const data = await this.$store.dispatch('wallet/fetchWithdrawList')

      if (data.length > 0) this.list = _.unionBy([...data, ...this.list], 'id')

      this.$refs.loadmore.topEnd(!(data.length < 15))
    },
    async onLoadMore () {
      const data = await this.$store.dispatch('wallet/fetchWithdrawList', {
        after: this.after,
      })

      if (data.length > 0) {
        this.list = [...this.list, ...data]
      }
      this.$refs.loadmore.bottomEnd(data.length < 15)
    },
  },
}
</script>

<style lang="less" scoped>
.p-wallet-detail {
  .header {
    overflow: initial;
  }
}
</style>
