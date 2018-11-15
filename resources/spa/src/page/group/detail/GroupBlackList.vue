<template>
  <div class="p-group-black-list">
    <search-bar v-model="keyword" class="search-bar"/>

    <template v-if="keyword.length">
      <ul>
        <li v-for="m in searchList" :key="m.id">
          <group-user-item :member="m" />
        </li>
      </ul>
    </template>

    <template v-else>
      <h3>黑名单({{ blackList.length }})</h3>
      <ul>
        <li v-for="m in blackList" :key="m.id">
          <group-user-item :member="m" @more="onMoreClick(m.id)" />
        </li>
      </ul>
    </template>

  </div>
</template>

<script>
import _ from "lodash";
import SearchBar from "@/components/common/SearchBar.vue";
import GroupUserItem from "../components/GroupUserItem.vue";

export default {
  name: "GroupBlackList",
  components: { SearchBar, GroupUserItem },
  data() {
    return {
      keyword: "",
      blackList: [],
      searchList: []
    };
  },
  computed: {
    group() {
      return this.$store.state.group.current;
    },
    groupId() {
      return Number(this.$route.params.groupId);
    }
  },
  watch: {
    keyword(val, oldVal) {
      if (val.trim() === "") return (this.searchList = []);
      if (val.trim() === oldVal.trim()) return;
      this.searchUser(val);
    }
  },
  mounted() {
    if (!this.group.id) this.fetchGroup();
    this.fetchMembers();
  },
  methods: {
    async fetchMembers() {
      const data = await this.$store.dispatch("group/getMembers", {
        groupId: this.groupId,
        type: "blacklist",
        limit: 100
      });
      this.blackList = data;
    },
    fetchGroup() {
      this.$store.dispatch("group/getGroupById", { groupId: this.groupId });
    },
    searchUser: _.debounce(async function(keyword) {
      this.searchList = [];
      const result = await this.$store.dispatch("group/getMembers", {
        groupId: this.groupId,
        name: keyword,
        type: "blacklist"
      });
      this.searchList = result;
    }, 450),
    onMoreClick(memberId) {
      const actions = [];
      actions.push({
        text: "移出黑名单",
        method: async () => {
          await this.$store.dispatch("group/moveoutBlackList", {
            groupId: this.groupId,
            memberId
          });
          this.blackList = this.blackList.filter(m => m.id !== memberId);
          this.$Message.success("操作成功");
          this.fetchMembers();
        }
      });
      this.$bus.$emit("actionSheet", actions);
    }
  }
};
</script>

<style lang="less" scoped>
.p-group-black-list {
  h3 {
    padding: 15px 30px;
    font-size: 28px;
  }
  > ul {
    background-color: #fff;
  }
}
</style>
