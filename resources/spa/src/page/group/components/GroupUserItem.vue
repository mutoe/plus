<template>
  <div class="c-group-user-item" @click="onUserClick">
    <div class="info">
      <avatar :user="user" class="avatar"/>
      <span class="name m-text-cut">{{ user.name }}</span>
      <span v-if="member.role === 'founder'" class="founder">圈主</span>
      <span v-if="member.role === 'administrator'" class="admin">管理员</span>
    </div>
    <div class="more" @click.stop="handleMore">
      <svg class="m-style-svg m-svg-small"><use xlink:href="#icon-more"/></svg>
    </div>
  </div>
</template>

<script>
export default {
  name: "GroupUserItem",
  props: {
    member: { type: Object, required: true }
  },
  computed: {
    user() {
      return this.member.user || {};
    }
  },
  methods: {
    onUserClick() {
      this.$router.push({
        name: "userDetail",
        params: { userId: this.user.id }
      });
    },
    handleMore() {
      this.$emit("more");
    }
  }
};
</script>

<style lang="less" scoped>
.c-group-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 134px;
  border-bottom: 1px solid @border-color;
  padding: 0 30px;

  .avatar {
    flex: none;
    margin-left: 0;
    margin-right: 30px;
  }

  .admin,
  .founder {
    display: inline-block;
    background-color: @gray;
    border-radius: 100px;
    font-size: 22px;
    margin-left: 30px;
    color: #fff;
    text-align: center;
    width: 4em;
    height: 30px;
    line-height: 30px;
  }

  .founder {
    background-color: #fca308;
  }
}
</style>
