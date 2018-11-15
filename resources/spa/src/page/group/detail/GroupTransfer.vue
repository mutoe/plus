<template>
  <div class="p-group-members">
    <search-bar v-model="keyword" class="search-bar"/>
    <h3>选择新圈主</h3>
    <ul>
      <li
        v-for="m in searchList"
        :key="m.id"
        @click.capture.stop="onChoose(m)">
        <group-user-item :member="m" />
      </li>
    </ul>
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
      searchList: []
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.CURRENTUSER;
    },
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
    this.searchUser();
  },
  methods: {
    fetchGroup() {
      this.$store.dispatch("group/getGroupById", { groupId: this.groupId });
    },
    searchUser: _.debounce(async function(keyword) {
      this.searchList = [];
      const result = await this.$store.dispatch("group/getMembers", {
        groupId: this.groupId,
        name: keyword,
        type: "audit_user",
        limit: 100
      });
      this.searchList = result.filter(m => m.user_id !== this.currentUser.id);
    }, 600),
    onChoose(member) {
      const actions = [
        {
          text: "确定",
          method: () => {
            this.transferGroup(member.user_id);
          }
        }
      ];
      const groupName = this.group.name;
      const username = member.user.name;
      const info = `确定将圈子"${groupName}"转让给"${username}", 使其成为新的圈主?`;
      this.$bus.$emit("actionSheet", actions, "取消", info);
    },
    transferGroup(userId) {
      this.$store
        .dispatch("group/transferGroup", {
          groupId: this.groupId,
          target: userId
        })
        .then(msg => {
          this.$Message.success(msg);
          this.$router.replace({
            name: "groupDetail",
            params: { groupId: this.group.id }
          });
        })
        .catch(({ response: { data: message } }) => {
          message && this.$Message.error(message);
        });
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
