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
    title: '全站粉丝排行榜',
    listUrl: '/rank/users/followers',
    api: '/ranks/followers?limit=15',
    name: 'rankFollowers',
  },
  {
    title: '财富达人排行榜',
    listUrl: '/rank/users/balance',
    api: '/ranks/balance?limit=15',
    name: 'rankBalance',
  },
  {
    title: '收入达人排行榜',
    listUrl: '/rank/users/income',
    api: '/ranks/income?limit=15',
    name: 'rankIncome',
  },
  {
    title: '社区签到排行榜',
    listUrl: '/rank/users/checkin',
    api: '/checkin-ranks?limit=15',
    name: 'rankCheckin',
  },
  {
    title: '社区专家排行榜',
    listUrl: '/rank/users/question-experts',
    api: '/question-ranks/experts?limit=15',
    name: 'rankQuestionExperts',
  },
  {
    title: '问答达人排行榜',
    listUrl: '/rank/users/question-likes',
    api: '/question-ranks/likes?limit=15',
    name: 'rankQuestionLikes',
  },
]

export default {
  name: 'RankUsers',
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
