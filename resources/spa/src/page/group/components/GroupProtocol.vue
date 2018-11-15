<template>
  <transition name="pop">
    <div v-if="visible" class="p-group-protocol">
      <common-header :back="close">圈子创建协议</common-header>
      <main class="m-art-body markdown-body" v-html="body"/>
    </div>
  </transition>
</template>

<script>
import { mapState } from "vuex";
import md from "@/util/markdown.js";

export default {
  name: "GroupProtocol",
  data() {
    return {
      visible: false
    };
  },
  computed: {
    ...mapState("group", ["protocol"]),
    body() {
      return md(this.protocol || "");
    }
  },
  created() {
    this.$store.dispatch("group/getProtocol");
  },
  methods: {
    show() {
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  }
};
</script>

<style lang="less">
.p-group-protocol {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 11;
  background-color: #fff;

  .markdown-body {
    font-size: 28px;
    color: #666;
    padding: 20px;
    height: calc(~"100% - 90px");
    overflow-y: auto;
  }
}
</style>
