<template>
  <div class="p-topic-detail">

    <common-header>{{ topic.name || "专题详情" }}</common-header>

    <!-- Topic base -->
    <main>
      <div class="topic">
        <img :src="avatar" class="avatar">
        <div class="title">
          <h3 class="topic-name m-text-cut">{{ topic.name }}</h3>
          <div class="label">
            <span>{{ topic.follows_count }}</span>&nbsp;关注
            ·
            <span>{{ topic.questions_count }}</span>&nbsp;问题
          </div>
        </div>

        <button
          v-if="topic.has_follow"
          class="follow active"
          @click="handleUnfollow(topic)" >
          <svg class="m-style-svg m-svg-small">
            <use xlink:href="#icon-yes"/>
          </svg>已关注
        </button>
        <button
          v-else
          class="follow"
          @click="handleFollow(topic)">
          <svg class="m-style-svg m-svg-small">
            <use xlink:href="#icon-plus"/>
          </svg>关注
        </button>
      </div>

      <!-- Topic desc -->
      <div class="topic-desc">专题简介：{{ topic.description }}</div>

      <!-- Experts -->
      <div class="experts">
        <span>{{ topic.experts_count }}位相关专家</span>
        <div>
          <avatar
            v-for="(user, index) in topic.experts"
            :user="user"
            :style="[{ zIndex: topic.experts.length - index }]"
            :key="user.id"
            size="tiny"
            class="experts-user" />
        </div>
      </div>

      <!-- Types nav -->
      <nav ref="types" class="types">
        <router-link
          :to="{ path: `/question-topics/${id}` }"
          replace
          exact
          exact-active-class="active">热门</router-link>
        <router-link
          :to="{ path: `/question-topics/${id}`, query: { type: 'excellent' } }"
          replace
          exact
          exact-active-class="active">精选</router-link>
        <router-link
          :to="{ path: `/question-topics/${id}`, query: { type: 'reward' } }"
          replace
          exact
          exact-active-class="active">悬赏</router-link>
        <router-link
          :to="{ path: `/question-topics/${id}`, query: { type: 'new' } }"
          replace
          exact
          exact-active-class="active">最新</router-link>
        <router-link
          :to="{ path: `/question-topics/${id}`, query: { type: 'all' } }"
          replace
          exact
          exact-active-class="active">全部</router-link>
      </nav>

      <!-- Questions -->
      <jo-load-more
        ref="loadmore"
        class="questions"
        @onRefresh="handleRefresh"
        @onLoadMore="handleLoadQuestions" >
        <question-card
          v-for="question in questions"
          :key="question.id"
          :question="question" />
      </jo-load-more>
    </main>

  </div>
</template>

<script>
import QuestionCard from "./components/QuestionCard.vue";
import * as api from "@/api/question/topics";

export default {
  name: "TopicDetail",
  components: {
    QuestionCard
  },
  data: () => ({
    topic: {},
    loading: true,
    questions: [],
    typeNavOffsetTop: 0
  }),
  computed: {
    id() {
      return this.$route.params.id;
    },
    type() {
      const { type = "hot" } = this.$route.query;
      return type;
    },
    avatar() {
      const avatar = this.topic.avatar || {};
      return avatar.url || null;
    }
  },
  watch: {
    $route(newRoute, oldRoute) {
      if (
        newRoute.path === oldRoute.path &&
        newRoute.query.type !== oldRoute.query.type
      ) {
        this.questions = [];
        this.$refs.loadmore.beforeRefresh();
      }
    }
  },
  mounted() {
    this.typeNavOffsetTop = this.$refs.types.offsetTop;
    document.addEventListener("scroll", this.handleScrolling);
  },
  methods: {
    handleRefresh() {
      api
        .show(this.id)
        .then(({ data }) => {
          this.loading = false;
          this.topic = data;
          this.handleRefreshQuestions();
        })
        .catch(({ response: { data } = {} }) => {
          this.loading = true;
          this.$refs.loadmore.afterRefresh(false);
          this.$Message.error(data);
        });
    },
    handleRefreshQuestions() {
      const offset = 0;
      const limit = 15;
      api
        .questions(this.id, this.type, offset, limit)
        .then(({ data }) => {
          this.questions = data;
          this.$refs.loadmore.afterRefresh(data.length < limit);
        })
        .catch(({ response: { data } = {} }) => {
          this.$refs.loadmore.afterRefresh(true);
          this.$Message.error(data);
        });
    },
    handleLoadQuestions() {
      const offset = this.questions.length;
      const limit = 15;
      api
        .questions(this.id, this.type, offset, limit)
        .then(({ data }) => {
          this.questions = [...this.questions, ...data];
          this.$refs.loadmore.afterLoadMore(data.length < limit);
        })
        .catch(({ response: { data } = {} }) => {
          this.$refs.loadmore.afterLoadMore(true);
          this.$Message.error(data);
        });
    },
    handleScrolling() {
      // const nav = this.$refs.types;
      // const offsetTop = this.typeNavOffsetTop;
      // const y = document.documentElement.scrollTop + 48;
      // if (y >= offsetTop) {
      //   nav.style.position = "fixed";
      //   nav.style.marginTop = 0;
      //   nav.style.top = "0.9rem";
      //   return;
      // }
      // nav.style.position = "relative";
      // nav.style.marginTop = "-1rem";
      // nav.style.top = "1.16rem";
    },
    handleFollow(topic) {
      api
        .followTopic(topic.id)
        .then(() => {
          topic.has_follow = true;
          this.follows_count += 1;
        })
        .catch(({ response: { data } = {} }) => {
          this.$Message.error(data);
        });
    },
    handleUnfollow(topic) {
      api
        .unfollowTopic(topic.id)
        .then(() => {
          topic.has_follow = false;
          topic.follows_count -= 1;
          if (this.type === "follow") {
            let newTopics = [];
            this.topics.forEach(_topic => {
              if (_topic.id !== topic.id) {
                newTopics.push(_topic);
              }
            });
            this.topics = newTopics;
          }
        })
        .catch(({ response: { data } = {} }) => {
          this.$Message.error(data);
        });
    }
  }
};
</script>

<style lang="less" scoped>
.p-topic-detail {
  main {
    width: 100%;
    height: auto;
  }

  .share {
    width: 40px;
    height: 90px;
    background-color: transparent;
    margin-top: 20px;

    > .icon {
      width: 40px;
      height: 40px;
    }
  }

  .topic {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 175px;
    padding: 28px 43px;
    background-color: #fff;
    border-bottom: solid 1px #ededed;

    > .avatar {
      flex: none;
      width: 120px;
      height: 120px;
      margin-right: 18px;
      background-color: #ededed;
    }

    .title {
      flex: auto;
      min-width: 0;

      .topic-name {
        display: block;
        font-size: 32px;
        font-weight: normal;
        font-stretch: normal;
        color: #333;
      }

      .label {
        margin-top: 19px;
        font-size: 28px;
        font-weight: normal;
        font-stretch: normal;
        color: #666;

        > span {
          color: @primary;
        }
      }
    }

    .follow {
      flex: none;
      height: 50px;
      background-color: #fff;
      border-radius: 8px;
      border: solid 2px @primary;
      color: @primary;
      font-size: 26px;
      font-weight: normal;
      font-stretch: normal;
      line-height: 5px;
      letter-spacing: 0px;
      outline: none;

      .m-svg-small {
        width: 28px;
        height: 28px;
        margin-right: 10px;
      }

      &.active {
        color: #ccc;
        border: solid 2px #ccc;
      }
    }
  }

  .topic-desc {
    width: 100%;
    font-size: 28px;
    color: #666;
    padding: 29px 30px;
    background-color: #fff;
  }

  .experts {
    width: 100%;
    padding: 30px;
    display: flex;
    background-color: #fff;
    border-top: solid 1px #ededed;
    justify-content: space-between;
    align-items: center;

    > span {
      font-size: 28px;
      color: #999;
    }

    .user {
      position: relative;
      border: solid 1px #fff;
      margin-left: -20px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  .types {
    margin-top: -100px;
    top: 110px;
    display: flex;
    width: 100%;
    height: 90px;
    justify-content: space-around;
    align-items: center;
    background: #fff;
    color: #999;
    font-size: 30px;
    font-weight: normal;
    font-stretch: normal;
    line-height: 0;
    letter-spacing: 0;
    border-bottom: solid 0.01rem #ededed;
    z-index: 100;
    position: relative;

    > a {
      color: #999;
    }

    .active {
      color: #333;
    }
  }

  .questions {
    padding-top: 110px;
  }
}
</style>
