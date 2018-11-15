<template>
  <div class="p-group-info">
    <common-header>详细信息</common-header>

    <form>
      <form-avatar-item
        v-model="group.avatar"
        :readonly="true"
        label="圈子头像"
        shape="square"
        type="storage" />

      <form-input-item
        v-model="group.name"
        :readonly="true"
        label="圈名"/>

      <form-input-item
        v-model="category.name"
        :readonly="true"
        label="分类"/>

      <!-- 标签选择 -->
      <form-tags-item v-model="group.tags" :readonly="true" />

      <!-- 位置选择 -->
      <form-input-item
        v-model="location"
        :readonly="true"
        type="textarea"
        label="位置"/>

      <form-input-item
        v-model="group.summary"
        :readonly="true"
        type="textarea"
        label="简介"/>

      <hr>

      <form-input-item
        v-model="group.notice"
        :readonly="true"
        type="textarea"
        label="公告"/>

    </form>
  </div>
</template>

<script>
export default {
  name: "GroupInfo",
  computed: {
    group() {
      return this.$store.state.group.current || {};
    },
    groupId() {
      return this.$route.params.groupId;
    },
    category() {
      return this.group.category || {};
    },
    location() {
      const location = this.group.location;
      if (location) return location;
      return "不显示位置";
    }
  },
  created() {
    if (!this.group.id) this.fetchGroupInfo();
  },
  methods: {
    fetchGroupInfo() {
      this.$store.dispatch("group/getGroupById", { groupId: this.groupId });
    }
  }
};
</script>

<style lang="less" scoped>
@import url("~@/components/form/formItem.less");

.p-group-info {
  .c-form-item {
    background-color: #fff;

    > label {
      flex: auto;
    }
  }

  .c-form-switch-item {
    border-bottom: 1px solid @border-color;
  }

  .footage {
    color: #b3b3b3;
    font-size: 20px;
    margin: 10px 14px 30px;
  }

  .check-label {
    display: block;
    position: relative;
    padding-left: 48px;
    margin-bottom: 12px;
    cursor: pointer;
    user-select: none;
    color: #333;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;

      &[value="true"] ~ .checkmark::after {
        display: block;
      }
    }

    .checkmark {
      position: absolute;
      top: 8px;
      left: 0;
      height: 30px;
      width: 30px;
      border: 1px solid @border-color;
      vertical-align: middle;

      &::after {
        content: "";
        position: absolute;
        display: none;
        left: 8px;
        top: 0;
        width: 12px;
        height: 24px;
        border: solid #70d0ab;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
      }
    }
  }

  .label-amount {
    display: flex;
    justify-content: space-around;
    text-align: right;
    padding-right: 20px;
    width: 10em;

    input {
      display: inline-block;
      height: 100%;
      width: 100%;
      text-align: right;
      margin-right: 20px;
      font-size: 30px;
    }

    > span {
      flex: none;
    }
  }
}

.bb {
  border-bottom: 1px solid @border-color;
}
</style>
