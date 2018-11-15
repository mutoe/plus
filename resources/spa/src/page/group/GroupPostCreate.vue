<template>
  <div class="p-group-post-create">

    <common-header>
      发帖
      <span
        slot="right"
        :class="{ disabled }"
        class="primary"
        @click="onSubmit">发布</span>
    </common-header>

    <section v-if="!groupId" class="form-select-item">
      <label>选择圈子</label>
      <div class="input-wrap" @click="selectGroup">
        <span class="placeholder">{{ group.name }}</span>
        <svg class="m-style-svg m-svg-def m-entry-append">
          <use xlink:href="#icon-arrow-right"/>
        </svg>
      </div>
    </section>

    <main>
      <div class="title-wrap">
        <input
          v-model="title"
          type="text"
          placeholder="输入标题，20字以内"
          maxlength="20">
      </div>

      <div class="content-wrap">
        <div class="textarea-shadow">{{ content }}</div> <!-- 用于撑起文本框自适应高度 -->
        <textarea
          v-model="content"
          placeholder="输入要说的话"
          rows="1"/>
      </div>
    </main>

    <form-switch-item
      v-if="group.allow_feed"
      v-model="feed"
      class="form-switch-item"
      label="同步至动态"/>

    <choose-group
      v-if="!groupId"
      ref="chooseGroup"
      @change="onGroupChange"/>

  </div>
</template>

<script>
import ChooseGroup from "./components/ChooseGroup.vue";

export default {
  name: "GroupPostCreate",
  components: {
    ChooseGroup
  },
  data() {
    return {
      title: "",
      content: "",
      group: {},
      feed: false
    };
  },
  computed: {
    groupId() {
      return this.$route.query.group;
    },
    disabled() {
      if (!this.groupId && !this.group.id) return true;
      return !this.title || !this.content;
    }
  },
  mounted() {
    this.initGroup();
  },
  methods: {
    async onSubmit() {
      if (this.disabled) return;
      const params = {
        groupId: this.groupId || this.group.id,
        title: this.title,
        body: this.content,
        summary: this.content,
        sync_feed: Number(this.feed)
      };
      const data = await this.$store.dispatch("group/createPost", params);
      if (data) {
        this.$Message.success(data.message);
        this.$router.replace({
          name: "groupPostDetail",
          params: { groupId: data.post.group_id, postId: data.post.id }
        });
      }
    },
    async initGroup() {
      // 从 store 中读取当前圈子信息
      if (!this.group.id && this.groupId)
        this.group = this.$store.state.group.current;

      // 如果没有读到, 去远端拉取
      if (!this.group.id && this.groupId)
        this.group = await this.$store.dispatch("group/getGroupById", {
          groupId: this.groupId
        });
    },

    selectGroup() {
      this.$refs.chooseGroup.show();
    },
    onGroupChange(group) {
      this.group = group;
    }
  }
};
</script>

<style lang="less" scoped>
.p-group-post-create {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;

  .disabled {
    color: #ccc;
  }

  .form-select-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 30px;
    border-bottom: 1px solid @border-color;

    .input-wrap {
      svg {
        vertical-align: middle;
      }
    }

    .placeholder {
      margin-right: 20px;
      color: #999;
    }
  }

  > main {
    padding: 30px;

    .title-wrap {
      padding-bottom: 15px;
      border-bottom: 2px solid @border-color;
    }

    .content-wrap {
      position: relative;
      width: 100%;
      height: calc(~"100% + 40px");
      padding-right: 20px;
      margin-top: 15px;

      .textarea-shadow {
        opacity: 0;
        min-height: 100px;
        padding: 28px 0;
        word-wrap: break-word;
        word-break: break-all;
      }

      textarea {
        position: absolute;
        top: 0;
        display: block;
        font-size: 30px;
        // padding: 28px 0;
        width: calc(~"100% - 20px");
        height: 100%;
        overflow: hidden;
        resize: none;
        outline: none;
        min-height: 100px;
        background-color: transparent;
        word-wrap: break-word;
        word-break: break-all;
      }
    }

    input,
    textarea {
      width: 100%;
      height: 100%;
      font-size: 30px;
    }
  }

  .form-switch-item {
    position: fixed;
    bottom: 0;
    border-top: 1px solid @border-color;
  }
}
</style>
