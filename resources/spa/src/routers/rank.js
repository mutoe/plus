/* 排行榜 */
const RankIndex = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/RankIndex.vue");
const RankUsers = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/children/RankUsers.vue");
const RankQuestions = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/children/RankQuestions.vue");
const RankFeeds = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/children/RankFeeds.vue");
const RankNews = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/children/RankNews.vue");
const RankFollowers = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/FansList.vue");
const RankBalances = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/BalanceList.vue");
const RankIncome = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/IncomeList.vue");
const RankQuestionExperts = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/ExpertList.vue");
const RankQuestionLikes = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/QuestionLikesList.vue");
const RankCheckinLikes = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/CheckinList.vue");
const RankQuestionList = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/RankQuestionList.vue");
const RankFeedList = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/RankFeedList.vue");
const RankNewsList = () =>
  import(/* webpackChunkName: 'rank' */ "../page/rank/lists/RankNewsList.vue");

export default [
  {
    path: "/rank",
    component: RankIndex,
    meta: { title: "排行" },
    redirect: "/rank/users",
    children: [
      {
        path: "users",
        component: RankUsers,
        meta: {
          keepAlive: true
        }
      },
      {
        path: "questions",
        component: RankQuestions,
        meta: {
          keepAlive: true
        }
      },
      {
        path: "feeds",
        component: RankFeeds,
        meta: {
          keepAlive: true
        }
      },
      {
        path: "news",
        component: RankNews,
        meta: {
          keepAlive: true
        }
      }
    ]
  } /* 排行 */,
  {
    path: "/rank/users/followers",
    component: RankFollowers,
    meta: {
      title: "全站粉丝排行榜",
      keepAlive: true
    }
  },
  {
    path: "/rank/users/balance",
    component: RankBalances,
    meta: {
      title: "财富达人排行榜",
      keepAlive: true
    }
  },
  {
    path: "/rank/users/income",
    component: RankIncome,
    meta: {
      title: "收入达人排行榜",
      keepAlive: true
    }
  },
  {
    path: "/rank/users/question-experts",
    component: RankQuestionExperts,
    meta: {
      title: "社区专家排行榜",
      keepAlive: true
    }
  },
  {
    path: "/rank/users/question-likes",
    component: RankQuestionLikes,
    meta: {
      title: "问答达人排行榜",
      keepAlive: true
    }
  },
  {
    path: "/rank/users/checkin",
    component: RankCheckinLikes,
    meta: {
      title: "社区签到排行榜",
      keepAlive: true
    }
  },
  {
    path: "/rank/q/:time",
    component: RankQuestionList,
    meta: {
      // keepAlive: true,
      title: "问答排行榜"
    }
  },
  {
    path: "/rank/f/:time",
    component: RankFeedList,
    meta: {
      // keepAlive: true,
      title: "动态排行榜"
    }
  },
  {
    path: "/rank/n/:time",
    component: RankNewsList,
    meta: {
      // keepAlive: true,
      title: "资讯排行榜"
    }
  }
];
