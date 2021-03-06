<template>
  <div class="p-news">
    <CommonHeader class="common-header">
      资讯
      <template slot="right">
        <svg class="m-style-svg m-svg-def" @click="$router.push({path: '/news/search'})">
          <use xlink:href="#icon-search" />
        </svg>
        <svg class="m-style-svg m-svg-def" @click="beforeCreatePost">
          <use xlink:href="#icon-news-draft" />
        </svg>
      </template>
    </CommonHeader>

    <NewsFilter v-if="isLogin" @change="onCateChange" />

    <JoLoadMore
      ref="loadmore"
      :class="{guest: !isLogin}"
      class="loadmore"
      @onRefresh="onRefresh"
      @onLoadMore="onLoadMore"
    >
      <!-- 资讯顶部 banner 广告位 -->
      <BannerAd type="news" />

      <template v-for="card in list">
        <NewsCard
          v-if="card.author"
          :key="`news${card.id}`"
          :current-cate="currentCate"
          :news="card"
        />
        <AdCard
          v-if="card.space_id"
          :key="`ad${card.id}`"
          :ad="card"
        />
      </template>
    </JoLoadMore>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import NewsCard from './components/NewsCard.vue'
import AdCard from './components/AdCard.vue'
import NewsFilter from './components/NewsFilter.vue'
import BannerAd from '@/components/advertisement/BannerAd.vue'

export default {
  name: 'NewsList',
  components: {
    NewsCard,
    AdCard,
    NewsFilter,
    BannerAd,
  },
  data () {
    return {
      list: [], // 混合列表
      currentCate: 0,
      newsList: [], // 资讯列表
    }
  },
  computed: {
    ...mapState({
      advertiseList: state => state.news.advertise.list,
      advertiseIndex: state => state.news.advertise.index,
      newsVerified: state => state.CONFIG.news.contribute.verified,
      userVerify: state => state.USER_VERIFY || {},
    }),
    after () {
      const len = this.newsList.length
      return len > 0 ? this.newsList[len - 1].id : 0
    },
    isLogin () {
      const user = this.$store.state.CURRENTUSER
      return Object.keys(user).length
    },
  },
  mounted () {
    this.$store.dispatch('news/getAdvertise')
    if (!this.newsList.length) this.$refs.loadmore.beforeRefresh()
    if (this.newsVerified) this.$store.dispatch('FETCH_USER_VERIFY')
  },
  methods: {
    onCateChange ({ id = 0 } = {}) {
      this.newsList = []
      this.currentCate = id
      this.$refs.loadmore.beforeRefresh()
    },
    async onRefresh (callback) {
      this.$store.commit('news/RESET_ADVERTISE')
      // GET /news
      const params =
        this.currentCate === 0
          ? { recommend: 1 }
          : { cate_id: this.currentCate }
      const data = await this.$store.dispatch('news/getNewsList', params)
      this.newsList = data
      this.$refs.loadmore.afterRefresh(data.length < 10)

      // 如果有广告,并且还没插入完,从广告栈顶取出一条随机插入列表
      if (this.advertiseIndex < this.advertiseList.length) {
        let rand = ~~(Math.random() * 9) + 1
        rand > data.length && (rand = data.length)
        data.splice(rand, 0, this.advertiseList[this.advertiseIndex])
        this.$store.commit('news/POPUP_ADVERTISE')
      }

      this.list = data
    },
    async onLoadMore (callback) {
      const params =
        this.currentCate === 0
          ? { recommend: 1 }
          : { cate_id: this.currentCate }
      Object.assign(params, { after: this.after })
      const data = await this.$store.dispatch('news/getNewsList', params)
      this.$refs.loadmore.afterLoadMore(data.length < 10)

      // 如果有广告,并且还没插入完,从广告栈顶取出一条随机插入列表
      if (this.advertiseIndex < this.advertiseList.length) {
        let rand = ~~(Math.random() * 9) + 1
        rand > data.length && (rand = data.length)
        data.splice(rand, 0, this.advertiseList[this.advertiseIndex])
        this.$store.commit('news/POPUP_ADVERTISE')
      }

      this.list = [...this.list, ...data]
    },
    /**
     * 投稿前进行认证确认
     */
    beforeCreatePost () {
      // 如果后台设置了不需要验证 或 用户已经认证就直接跳转
      const noNeedVerify =
        !this.$store.state.CONFIG.news.contribute.verified ||
        !_.isEmpty(this.$store.state.CURRENTUSER.verified)
      if (noNeedVerify) return this.$router.push({ path: '/post/release' })
      else if (this.userVerify.status === 0) {
        this.$Message.error('您的认证正在等待审核，通过审核后可发布帖子')
      } else {
        const actions = [
          {
            text: '个人认证',
            method: () =>
              this.$router.push({
                path: '/profile/certificate',
                query: { type: 'user' },
              }),
          },
          {
            text: '企业认证',
            method: () =>
              this.$router.push({
                path: '/profile/certificate',
                query: { type: 'org' },
              }),
          },
        ]
        this.$bus.$emit(
          'actionSheet',
          actions,
          '取消',
          '认证用户才能创建投稿，去认证？'
        )
      }
    },
  },
}
</script>

<style lang="less" scoped>
.p-news {
  .common-header {
    position: fixed;
  }

  .loadmore {
    padding-top: 90+80px;

    &.guest {
      padding-top: 90px;
    }
  }
}
</style>
