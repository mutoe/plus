<template>
  <div class="p-group-list">

    <common-header class="common-header">
      全部圈子
      <template slot="right">
        <svg class="m-style-svg m-svg-def" @click="$router.push({name: 'groupSearch'})">
          <use xlink:href="#icon-search"/>
        </svg>
        <svg class="m-style-svg m-svg-def" @click="$router.push({name: 'groupCreate'})">
          <use xlink:href="#icon-group-create"/>
        </svg>
      </template>
    </common-header>

    <nav class="groups-nav">
      <router-link
        :to="{name: 'groups', query: { type: 'recommend' }}"
        class="item"
        exact
        replace
        tag="div"
        active-class="active">
        <span>推荐</span>
      </router-link>
      <router-link
        v-for="cate in categories"
        :to="{ name: 'groups', query: { category: cate.id } }"
        :key="cate.id"
        class="item"
        exact
        replace
        tag="div"
        active-class="active">
        <span class="m-text-cut">{{ cate.name }}</span>
      </router-link>
    </nav>

    <main>
      <jo-load-more
        ref="loadmore"
        :auto-load="false"
        @onRefresh="onRefresh"
        @onLoadMore="onLoadMore">
        <div
          v-for="group in groups"
          :key="group.id"
          class="group-item-wrap">
          <group-item :group="group" :show-action="true" />
        </div>
      </jo-load-more>
    </main>
  </div>
</template>

<script>
import GroupItem from "./components/GroupItem.vue";

export default {
  name: "GroupList",
  components: {
    GroupItem
  },
  data() {
    return {
      GROUPS: new Map(),
      GROUPChangeTracker: 1
    };
  },
  computed: {
    categories() {
      return this.$store.state.group.categories;
    },
    recommend: {
      get() {
        return this.$route.query.type || false;
      },
      set(val) {
        this.$route.query.type = val ? "recommend" : "";
      }
    },
    category() {
      return this.$route.query.category;
    },
    currentUserID() {
      return this.$store.state.CURRENTUSER.id;
    },
    currentType() {
      return this.recommend ? -1 : this.category;
    },
    groups() {
      return this.currentType &&
        this.GROUPChangeTracker &&
        this.GROUPS.has(this.currentType)
        ? Array.from(this.GROUPS.get(this.currentType).values())
        : [];
    }
  },
  watch: {
    currentType(val) {
      val && this.$refs.loadmore.beforeRefresh();
    }
  },
  created() {
    if (!this.$route.query.type && !this.$route.query.category)
      this.$router.replace(
        Object.assign({}, this.$route, { query: { type: "recommend" } })
      );
    this.$store.dispatch("group/getGroupTypes");
  },
  mounted() {
    this.$refs.loadmore.beforeRefresh();
  },
  methods: {
    formateGroups(groups) {
      const map = this.GROUPS.has(this.currentType)
        ? this.GROUPS.get(this.currentType)
        : new Map();
      groups.forEach(group => {
        map.set(group.id, group);
      });
      this.GROUPS.set(this.currentType, map);
      this.GROUPChangeTracker += 1;
    },
    switchCate(cate) {
      this.recommend = false;
      this.$route.query.category = cate.id;
    },
    async onRefresh() {
      const params = {};
      if (this.recommend) params.type = "recommend";
      else params.categoryId = this.category;

      const data = await this.$store.dispatch("group/getGroups", params);
      this.formateGroups(data);
      this.$refs.loadmore.afterRefresh(data.length < 15);
    },
    async onLoadMore() {
      const params = { offset: this.groups.length };
      if (this.recommend) params.type = "recommend";
      else params.categoryId = this.category;

      const data = await this.$store.dispatch("group/getGroups", params);
      this.formateGroups(data);
      this.$refs.loadmore.afterLoadMore(data.length < 15);
    }
  }
};
</script>

<style lang="less" scoped>
.p-group-list {
  .common-header {
    position: fixed;
    top: 0;
  }

  .groups-nav {
    position: fixed;
    display: flex;
    align-items: center;
    padding: 0 30px;
    top: 90px;
    height: 90px;
    left: 0;
    right: 0;
    flex-wrap: nowrap;
    font-size: 26px;
    color: @text-color3;
    overflow-y: auto;
    border-bottom: 1px solid @border-color;
    z-index: 10;
    max-width: 1080px;
    background-color: #fff;

    .item {
      flex: 0 0 auto;
      transition: all 0.1s ease;

      + .item {
        margin-left: 50px;
      }

      &.active {
        color: @text-color1;
        font-size: 30px;
      }
    }
  }

  > main {
    padding-top: 180px;

    .group-item-wrap {
      + .group-item-wrap {
        border-top: 1px solid @border-color;
      }
    }
  }
}
</style>
