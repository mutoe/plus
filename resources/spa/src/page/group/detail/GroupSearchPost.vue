<template>
  <div class="p-search-post">

    <search-bar v-model="keywordOrigin" position="fixed"/>

    <jo-load-more
      ref="loadmore"
      :auto-load="false"
      :show-bottom="list.length > 0"
      class="lodemore"
      @onRefresh="onSearchInput"
      @onLoadMore="onLoadMore">
      <group-feed-card
        v-for="post in list"
        :key="post.id"
        :feed="post"/>
    </jo-load-more>

    <p v-show="loading" class="load-more-ph m-text-c mt10">正在搜索...</p>
    <div v-show="noResult && !loading && !list.length" class="m-no-find"/>

  </div>
</template>

<script>
import _ from "lodash";
import SearchBar from "@/components/common/SearchBar.vue";
import GroupFeedCard from "@/components/FeedCard/GroupFeedCard.vue";

export default {
  name: "SearchPost",
  components: {
    SearchBar,
    GroupFeedCard
  },
  data() {
    return {
      keywordOrigin: "",
      list: [],
      loading: false,
      noResult: false
    };
  },
  computed: {
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
    }
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
      const data = await this.$store.dispatch("group/searchPosts", {
        keyword: this.keyword,
        group_id: this.groupId
      });
      this.loading = false;
      this.list = data;
      this.noResult = !this.list.length;
      this.$refs.loadmore.afterRefresh(data.length < 15);
    }, 600),

    async onLoadMore() {
      if (!this.keyword) return;
      this.loading = true;
      const data = await this.$store.dispatch("group/searchPosts", {
        keyword: this.keyword,
        group_id: this.groupId,
        offset: this.list.length
      });
      this.loading = false;
      this.list = [...this.list, ...data];
      this.$refs.loadmore.afterLoadMore(data.length < 15);
    }
  }
};
</script>

<style lang="less" scoped>
.p-search-post {
  height: 100%;

  .m-no-find {
    height: calc(~"100% - 90px");
  }
}
</style>
