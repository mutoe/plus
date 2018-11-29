<template>
  <div :class="`${prefixCls}`">
    <div :class="`${prefixCls}-container`">
      <JoLoadMore
        ref="loadmore"
        :class="`${prefixCls}-loadmore`"
        @onRefresh="onRefresh"
        @onLoadMore="onLoadMore"
      >
        <AuditStatusGroupJoin
          v-for="audit in audits"
          :key="`group-join-${audit.id}`"
          :class="`${prefixCls}-item`"
          :audit="audit"
        />
      </JoLoadMore>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import AuditStatusGroupJoin from '../../components/AuditStatusGroupJoin.vue'

const prefixCls = 'msgList'

export default {
  name: 'GroupJoinAudit',
  components: {
    AuditStatusGroupJoin,
  },
  data: () => ({
    prefixCls,
  }),
  computed: {
    ...mapState({
      audits: state => state.MESSAGE.MY_GROUP_JOIN_AUDIT,
    }),
  },
  methods: {
    onRefresh () {
      this.$http
        .get('/plus-group/user-group-audit-members', {
          validateStatus: s => s === 200,
        })
        .then(({ data }) => {
          if (data.length > 0) {
            this.$store.commit('SAVE_JOIN_GROUP_AUDITS', {
              type: 'new',
              data,
            })
          }
          this.$refs.loadmore.afterRefresh(data.length < 15)
        })
    },
    onLoadMore () {
      const { id = 0 } = _.head(this.audits) || {}
      if (id === 0) {
        this.$refs.loadmore.afterLoadMore(true)
        return false
      }

      this.$http
        .get('/plus-group/user-group-audit-members', {
          validateStatus: s => s === 200,
        })
        .then(({ data }) => {
          this.$refs.loadmore.afterLoadMore(data.length < 15)
          if (data.length > 0) {
            this.$store.commit('SAVE_JOIN_GROUP_AUDITS', {
              type: 'more',
              data,
            })
          }
        })
    },
  },
}
</script>
<style lang="less" src="../../style.less">
</style>
