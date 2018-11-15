<template>
  <div class="p-question-search">

    <search-bar v-model="keyword"/>

    <nav class="questions-nav">
      <router-link
        to="/question/search"
        replace
        exact
        exact-active-class="active">问题</router-link>
      <router-link
        :to="{path: '/question/search', query: {type: 'topic'}}"
        replace
        exact
        exact-active-class="active">专题</router-link>
    </nav>

    <jo-load-more
      ref="loadmore"
      :auto-load="false"
      :show-bottom="list.length > 0"
      style="padding-top: 0.9rem"
      @onRefresh="onRefresh"
      @onLoadMore="onLoadMore">
      <template v-if="type === 'question'">
        <question-card
          v-for="question in list"
          :key="question.id"
          :question="question" />
      </template>
      <template v-else>
        <topic-card
          v-for="topic in list"
          :key="topic.id"
          :topic="topic" />
      </template>
    </jo-load-more>

    <div v-show="noData" class="m-no-find"/>
  </div>
</template>

<script>
import _ from "lodash";
import SearchBar from "@/components/common/SearchBar.vue";
import TopicCard from "./components/TopicCard.vue";
import QuestionCard from "./components/QuestionCard.vue";
import { queryList as queryQuestions } from "@/api/question/questions";
import { query as queryTopics } from "@/api/question/topics";
import { limit } from "@/api";
import { noop } from "@/util";

export default {
  name: "QuestionSearch",
  components: { TopicCard, QuestionCard, SearchBar },
  data() {
    return {
      type: "question",
      keyword: "", // search keyword
      offset: 0, // search offset
      limit: 15,
      list: [], // search result
      noData: false
    };
  },
  computed: {
    after() {
      const len = this.list.length;
      return len > 0 ? this.list[len - 1].id : 0;
    }
  },
  watch: {
    $route(to) {
      this.type = to.query.type || "question";
      this.list = [];
      this.offset = 0;
      this.noData = false;
      this.keyword = "";
    },
    keyword() {
      this.searchQuestions();
    }
  },
  mounted() {
    this.type = this.$route.query.type || "question";
  },
  methods: {
    /**
     * 使用 lodash.debounce 防抖，每输入 600ms 后执行
     * 不要使用箭头函数，会导致 this 作用域丢失
     *
     * @author mutoe <mutoe@foxmail.com>
     * @param {InputEvent} input event
     * @param {requestCallback} callback
     */
    searchQuestions: _.debounce(function(event, callback) {
      if (!this.keyword) return;
      this.offset = 0;
      this.type === "question"
        ? this.queryQuestions(callback)
        : this.queryTopics(callback);
    }, 600),

    queryQuestions(callback = noop) {
      const params = {
        offset: this.offset,
        limit: this.limit,
        type: "all",
        subject: this.keyword
      };
      queryQuestions(params).then(({ data }) => {
        if (this.offset === 0) {
          this.list = data;
        } else {
          this.list = [...this.list, ...data];
        }
        this.noData = !this.list.length;
        callback(data.length < limit);
      });
    },
    queryTopics(callback = noop) {
      const params = {
        offset: this.offset,
        limit: this.limit,
        name: this.keyword
      };
      queryTopics(params).then(({ data }) => {
        if (this.offset === 0) {
          this.list = data;
        } else {
          this.list = [...this.list, ...data];
        }
        this.noData = !this.list.length;
        callback(data.length < limit);
      });
    },
    onRefresh(callback) {
      this.offset = 0;
      this.searchQuestions(null, callback);
    },
    onLoadMore(callback) {
      this.offset = this.list.length;
      this.searchQuestions(null, callback);
    }
  }
};
</script>

<style lang="less" scoped>
.p-question-search {
  height: calc(~"100% - 180px");

  .m-head-top-title {
    padding: 0 20px 0 0;
    .m-search-box {
      width: 100%;
    }
  }

  .questions-nav {
    position: fixed;
    top: 90px;
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
    border-bottom: solid 0.01rem #d7d8d8;
    z-index: 1;

    @media screen and (min-width: 769px) {
      width: 768px;
    }
    > a {
      color: #d7d8d8;
    }
    .active {
      color: #333;
    }
  }
  .m-no-find {
    height: 100%;
  }
}
</style>

<style lang="less">
.p-question-search {
  .jo-loadmore-head {
    top: 90px;
  }
}
</style>
