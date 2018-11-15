<template>
  <div class="p-group-permission">
    <common-header>发帖权限设置</common-header>
    <main>
      <ul class="list">
        <li :class="{active: current === 'member'}" @click="current = 'member'">所有成员</li>
        <li :class="{active: current === 'founder'}" @click="current = 'founder'">仅圈主</li>
        <li :class="{active: current === 'manager'}" @click="current = 'manager'">仅圈主和管理员</li>
      </ul>
    </main>
  </div>
</template>

<script>
export default {
  name: "GroupPermission",
  data() {
    return {
      current: this.remote
    };
  },
  computed: {
    groupId() {
      return this.$route.params.groupId;
    },
    group() {
      return this.$store.state.group.current;
    },
    remote() {
      let permissions = this.group.permissions || "";
      permissions = permissions.split(",");
      if (permissions.includes("member")) return "member";
      else if (permissions.includes("administrator")) return "manager";
      return "founder";
    }
  },
  watch: {
    current(val, oldVal) {
      this.current = val;
      if (!oldVal) return;
      this.switch(val);
    },
    remote(val) {
      this.current = val;
    }
  },
  mounted() {
    this.current = this.remote;
  },
  methods: {
    switch(role) {
      let permissions = ["founder"];
      if (role === "manager") permissions.push("administrator");
      if (role === "member") permissions.push("member", "administrator");
      this.$store.dispatch("group/changePermissions", {
        groupId: this.groupId,
        permissions
      });
    }
  }
};
</script>

<style lang="less" scoped>
.p-group-permission {
  .list {
    > li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100px;
      background-color: #fff;
      padding: 0 30px;

      + li {
        border-top: 1px solid @border-color;
      }

      &.active::after {
        content: "✓";
        color: @primary;
      }
    }
  }
}
</style>
