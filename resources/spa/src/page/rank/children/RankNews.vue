<template>
  <div>
    <RankUsersComponent
      v-for="rank in ranks"
      :key="rank.name"
      :title="rank.title"
      :api="rank.api"
      :name="rank.name"
      :list-url="rank.listUrl"
    />
  </div>
</template>

<script>
import RankUsersComponent from '../components/RankUsersComponent'

const ranks = [
  {
    title: '今日资讯排行榜',
    listUrl: '/rank/n/today',
    api: '/news/ranks?type=day&limit=15',
    name: 'rankNewsToday',
  },
  {
    title: '一周资讯排行榜',
    listUrl: '/rank/n/week',
    api: '/news/ranks?type=week&limit=15',
    name: 'rankNewsWeek',
  },
  {
    title: '本月资讯排行榜',
    listUrl: '/rank/n/month',
    api: '/news/ranks?type=month&limit=15',
    name: 'rankNewsMonth',
  },
]

export default {
  name: 'RankNews',
  components: {
    RankUsersComponent,
  },
  data () {
    return {
      ranks,
    }
  },
}
</script>
