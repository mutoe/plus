<template>
  <div class="p-profile-news">

    <common-header>我的投稿</common-header>

    <main style="padding-top: .9rem">
      <div class="m-pos-f m-box m-aln-center m-justify-bet m-sub-nav m-bb1 m-main">
        <router-link
          replace
          exact
          tag="div"
          exact-active-class="active"
          to="/profile/news/released"
          class="m-sub-nav-item">
          <a>已发布</a>
        </router-link>
        <router-link
          replace
          exact
          tag="div"
          exact-active-class="active"
          to="/profile/news/auditing"
          class="m-sub-nav-item">
          <a>投稿中</a>
        </router-link>
        <router-link
          replace
          exact
          tag="div"
          exact-active-class="active"
          to="/profile/news/rejected"
          class="m-sub-nav-item">
          <a>被驳回</a>
        </router-link>
      </div>
      <p class="info-tips">开源版无此功能，需要使用此功能，请购买正版授权源码，详情访问www.thinksns.com，也可直接咨询：QQ3515923610；电话：17311245680。</p>
    </main>
  </div>
</template>
<script>
import { getMyNews } from '@/api/news.js'
import NewsCard from '@/page/news/components/NewsCard.vue'

export default {
  components: {
    NewsCard,
  },
  data () {
    const released = new Map()
    const auditing = new Map()
    const rejected = new Map()
    return {
      released,
      auditing,
      rejected,
      ChangeTracker: 1,
    }
  },
  computed: {
    newsList () {
      return (
        this.type &&
        this.ChangeTracker &&
        Array.from(this.$data[this.type].values())
      )
    },
    type () {
      return this.$route.params.type
    },
    after () {
      const last = this.newsList.slice(-1)[0]
      return last ? last.id : 0
    },
    typeParam () {
      if (this.type === 'released') {
        return 0
      }
      if (this.type === 'rejected') {
        return 3
      }
      return 1
    },
    params () {
      const { typeParam: type, after } = this
      return {
        type,
        after,
        limit: 15,
      }
    },
  },
  watch: {
    type (val) {
      this.isCurrentView && val && this.$refs.loadmore.beforeRefresh()
    },
  },
  activated () {
    this.isCurrentView = true
  },
  deactivated () {
    this.isCurrentView = false
  },
  methods: {
    formatNews (newsList) {
      newsList.forEach(news => {
        this.$data[this.type].set(news.id, news)
        this.ChangeTracker += 1
      })
    },
    onRefresh () {
      getMyNews({ ...this.params }).then(({ data }) => {
        this.formatNews(data)
        this.$refs.loadmore.afterRefresh(data.length < this.params.limit)
      })
    },
    onLoadMore () {
      getMyNews({ ...this.params }).then(({ data = [] }) => {
        this.formatNews(data)
        this.$refs.loadmore.afterLoadMore(data.length < this.params.limit)
      })
    },
  },
}
</script>
<style lang="less">
.p-profile-news {
  .m-sub-nav {
    top: 90px;
    z-index: 2;

    .m-sub-nav-item {
      height: 100%;
      line-height: 90px;
      text-align: center;

      &.router-link-active {
        color: #333;
        border-bottom: 4px solid @primary;
      }
    }
  }
}
</style>
