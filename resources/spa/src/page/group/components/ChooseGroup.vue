<template>
  <transition name="popr">
    <div v-if="visible" class="p-choose-group">
      <common-header :back="close">选择圈子</common-header>

      <ul class="list">
        <li
          v-for="group in list"
          :key="group.id"
          @click.capture.stop="selectGroup(group)">
          <group-item :group="group"/>
        </li>
      </ul>

    </div>

  </transition>
</template>

<script>
import GroupItem from "./GroupItem.vue";

export default {
  name: "ChooseGroup",
  components: { GroupItem },
  data() {
    return {
      visible: false,
      list: []
    };
  },
  created() {
    this.fetchList();
  },
  methods: {
    show() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    async fetchList() {
      const list = await this.$store.dispatch("group/getMyGroups");
      this.list = list;
    },
    selectGroup(group) {
      this.$emit("change", group);
      this.close();
    }
  }
};
</script>

<style lang="less" scoped>
.p-choose-group {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 11;
  background-color: #f4f5f5;

  .list {
    > li + li {
      border-top: 1px solid @border-color;
    }
  }
}
</style>
