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
    title: '今日解答排行榜',
    listUrl: '/rank/q/today',
    api: '/question-ranks/answers?type=day&limit=15',
    name: 'rankQuestionsToday',
  },
  {
    title: '一周解答排行榜',
    listUrl: '/rank/q/week',
    api: '/question-ranks/answers?type=week&limit=15',
    name: 'rankQuestionsWeek',
  },
  {
    title: '本月解答排行榜',
    listUrl: '/rank/q/month',
    api: '/question-ranks/answers?type=month&limit=15',
    name: 'rankQuestionsMonth',
  },
]

export default {
  name: 'RankQuestions',
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
