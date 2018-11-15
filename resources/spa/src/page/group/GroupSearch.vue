<template>
  <div class="p-group-search">

    <search-bar v-model="keywordOrigin" class="search-bar"/>

    <nav-tab
      :nav="nav"
      :route="{name: 'groupSearch', query: 'type'}"
      class="nav-tab"/>

    <jo-load-more
      ref="loadmore"
      :auto-load="false"
      :show-bottom="list.length > 0 "
      class="loadmore"
      @onRefresh="onSearchInput"
      @onLoadMore="onLoadMore">

      <template v-if="type === 'posts'">
        <group-feed-card
          v-for="post in list"
          :key="post.id"
          :feed="post"/>
      </template>

      <template v-else-if="type === 'groups' && keyword.length > 0">
        <group-item
          v-for="group in list"
          :key="group.id"
          :group="group"/>
      </template>

      <template v-else>
        <group-item
          v-for="group in recommendList"
          :key="group.id"
          :group="group"/>
      </template>

    </jo-load-more>

    <p v-show="loading" class="load-more-ph m-text-c mt10">正在搜索...</p>
    <template v-if="noResult &&!loading && keyword && !list.length" >
      <div v-if="type === 'posts'" class="no-groups">
        <p> 未找到相关帖子～</p>
        <button @click="$router.push({name: 'groupCreatePost'})">去发帖</button>
      </div>
      <div v-else class="no-groups">
        <p> 未找到相关圈子, 创建属于自己的圈子吧</p>
        <button @click="$router.push({name: 'groupCreate'})">创建圈子</button>
      </div>
    </template>

  </div>
</template>

<script>
import _ from "lodash";
import SearchBar from "@/components/common/SearchBar.vue";
import NavTab from "@/components/common/NavTab.vue";
import GroupItem from "./components/GroupItem.vue";
import GroupFeedCard from "@/components/FeedCard/GroupFeedCard.vue";

export default {
  name: "SearchPost",
  components: {
    SearchBar,
    NavTab,
    GroupItem,
    GroupFeedCard
  },
  data() {
    return {
      keywordOrigin: "",
      list: [],
      recommendList: [],
      loading: false,
      noResult: false,
      nav: {
        groups: "圈子",
        posts: "帖子"
      }
    };
  },
  computed: {
    type() {
      return this.$route.query.type || "groups";
    },
    keyword() {
      return this.keywordOrigin.trim();
    },
    groupId() {
      return this.$route.params.groupId;
    }
  },
  watch: {
    keyword() {
      this.onSearchInput();
    },
    type() {
      this.list = [];
      this.onSearchInput();
    }
  },
  created() {
    // 如果不带参 默认搜索圈子
    if (!this.$route.query.type) this.$route.query.type = "groups";
    // 如果搜索圈子, 没有数据时显示推荐的列表
    if (this.type === "groups") this.fetchRecommendGroups();
  },
  methods: {
    /**
     * 使用 lodash.debounce 防抖，每输入 600ms 后执行
     * 不要使用箭头函数，会导致 this 作用域丢失
     * @author mutoe <mutoe@foxmail.com>
     */
    onSearchInput: _.debounce(async function() {
      if (!this.keyword) return;
      this.loading = true;
      const data = await this.search();
      this.loading = false;
      this.list = data;
      this.noResult = !this.list.length;
      this.$refs.loadmore.afterRefresh(data.length < 15);
    }, 600),

    async onLoadMore() {
      if (!this.keyword) return;
      this.loading = true;
      const data = await this.search(this.list.length);
      this.loading = false;
      this.list = [...this.list, ...data];
      this.$refs.loadmore.afterLoadMore(data.length < 15);
    },

    search(offset) {
      if (this.type === "groups")
        return this.$store.dispatch("group/searchGroups", {
          keyword: this.keyword,
          offset
        });
      else
        return this.$store.dispatch("group/searchPosts", {
          keyword: this.keyword,
          group_id: this.groupId,
          offset
        });
    },

    async fetchRecommendGroups() {
      const data = await this.$store.dispatch("group/getGroups", {
        type: "recommend"
      });
      this.recommendList = data;
      this.$refs.loadmore.afterRefresh(true);
    }
  }
};
</script>

<style lang="less" scoped>
.p-group-search {
  height: 100%;

  .loadmore {
    padding-top: 90+90px;
    height: 100%;
  }
  .search-bar {
    position: fixed;
  }
  .nav-tab {
    position: fixed;
    top: 90px;
  }
  .m-no-find {
    height: 100%;
    position: fixed;
    top: 0;
    width: 100%;
  }
  .no-groups {
    padding-top: 180px;
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;

    > button {
      background-color: @primary;
      color: #fff;
      border-radius: 8px;
      padding: 15px 120px;
      font-size: 32px;
      margin-top: 30px;
    }
  }
}
</style>
