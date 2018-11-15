<template>
  <div class="p-answer-add">
    <common-header class="header">
      添加回答
      <span
        slot="right"
        :class="{disabled}"
        class="post-btn"
        @click="onPost">发布</span>
    </common-header>

    <main>
      <textarea v-model="content" placeholder="请输入你的回答"/>
    </main>

    <footer>
      <v-switch
        v-model="anonymity"
        type="checkbox"
        class="m-box m-bt1 m-bb1 m-lim-width m-pinned-row">
        <slot>匿名回答</slot>
      </v-switch>
    </footer>
  </div>
</template>

<script>
export default {
  name: "AnswerAdd",
  data() {
    return {
      content: "",
      anonymity: false
    };
  },
  computed: {
    questionId() {
      return this.$route.params.questionId || 0;
    },
    disabled() {
      return !this.content;
    }
  },
  methods: {
    async onPost() {
      if (this.disabled) return;
      const payload = {
        questionId: this.questionId,
        content: this.content.replace(/\n/g, "\n\n"),
        anonymity: this.anonymity ? 1 : 0
      };
      await this.$store.dispatch("question/postAnswer", payload);
      this.goBack();
    }
  }
};
</script>

<style lang="less" scoped>
.p-answer-add {
  display: flex;
  flex-direction: column;
  height: 100%;

  .header {
    .post-btn {
      color: @primary;
      &.disabled {
        color: @border-color;
      }
    }
  }

  > main {
    flex: auto;
    background-color: #fff;

    textarea {
      padding: 20px;
      font-size: 30px;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
