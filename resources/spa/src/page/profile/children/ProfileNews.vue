<template>
  <div class="p-profile-news">
    <CommonHeader>我的投稿</CommonHeader>

    <main style="padding-top: .9rem">
      <div class="m-pos-f m-box m-aln-center m-justify-bet m-sub-nav m-bb1 m-main">
        <RouterLink
          replace
          exact
          tag="div"
          exact-active-class="active"
          to="/profile/news/released"
          class="m-sub-nav-item"
        >
          <a>已发布</a>
        </RouterLink>
        <RouterLink
          replace
          exact
          tag="div"
          exact-active-class="active"
          to="/profile/news/auditing"
          class="m-sub-nav-item"
        >
          <a>投稿中</a>
        </RouterLink>
        <RouterLink
          replace
          exact
          tag="div"
          exact-active-class="active"
          to="/profile/news/rejected"
          class="m-sub-nav-item"
        >
          <a>被驳回</a>
        </RouterLink>
      </div>
      <JoLoadMore
        ref="loadmore"
        @onRefresh="onRefresh"
        @onLoadMore="onLoadMore"
      >
        <NewsCard
          v-for="news in newsList"
          :key="news.id"
          :news="news"
        />
      </JoLoadMore>
    </main>
  </div>
</template>
<script>
import { getMyNews } from '@/api/news.js'

export default {
  components: {
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
