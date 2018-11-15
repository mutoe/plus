<template>
  <div class="p-group-members">
    <search-bar v-model="keyword" class="search-bar"/>

    <template v-if="keyword.length">
      <ul>
        <li v-for="m in searchList" :key="m.id">
          <group-user-item :member="m" @more="onMoreClick(m)" />
        </li>
      </ul>
    </template>
    <template v-else>
      <h3>圈管理({{ administrator.length }})</h3>
      <ul>
        <li v-for="m in administrator" :key="m.id">
          <group-user-item :member="m" @more="onMoreClick(m)" />
        </li>
      </ul>

      <h3>成员({{ member.length }})</h3>
      <ul>
        <li v-for="m in member" :key="m.id">
          <group-user-item :member="m" @more="onMoreClick(m)" />
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
  name: "GroupMembers",
  components: { SearchBar, GroupUserItem },
  data() {
    return {
      keyword: "",
      member: [],
      administrator: [],
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
  created() {
    if (!this.group.id) this.fetchGroup();
    this.fetchMembers();
  },
  methods: {
    async fetchMembers() {
      const managerPromise = this.$store.dispatch("group/getMembers", {
        groupId: this.groupId,
        type: "manager",
        limit: 100
      });
      const memberPromise = this.$store.dispatch("group/getMembers", {
        groupId: this.groupId,
        type: "member",
        limit: 100 // TODO: paginate
      });
      // 并发
      const [manager, member] = await Promise.all([
        managerPromise,
        memberPromise
      ]);
      this.member = member;
      this.administrator = manager.sort(m => m.role !== "founder");
    },
    fetchGroup() {
      this.$store.dispatch("group/getGroupById", { groupId: this.groupId });
    },
    searchUser: _.debounce(async function(keyword) {
      this.searchList = [];
      const result = await this.$store.dispatch("group/getMembers", {
        groupId: this.groupId,
        name: keyword
      });
      this.searchList = result;
    }, 600),
    onMoreClick(member) {
      const actions = [];
      if (member.role === "member")
        actions.push({
          text: "加入黑名单",
          method: () => {
            const actions = [
              {
                text: "加入黑名单",
                method: async () => {
                  await this.$store.dispatch("group/addToBlackList", {
                    groupId: this.groupId,
                    memberId: member.id
                  });
                  this.member = this.member.filter(m => m.id !== member.id);
                  this.$Message.success("操作成功");
                  this.fetchMembers();
                }
              }
            ];
            setTimeout(() => {
              this.$bus.$emit(
                "actionSheet",
                actions,
                "取消",
                "确认加入黑名单？"
              );
            }, 200);
          }
        });
      if (actions.length) this.$bus.$emit("actionSheet", actions);
    }
  }
};
</script>

<style lang="less" scoped>
.p-group-members {
  h3 {
    padding: 15px 30px;
    font-size: 28px;
  }
  > ul {
    background-color: #fff;
  }
}
</style>
