<template>
  <div class="p-answer-add">
    <CommonHeader class="header">
      添加回答
      <span
        slot="right"
        :class="{disabled}"
        class="post-btn"
        @click="onPost"
      >
        发布
      </span>
    </CommonHeader>

    <main>
      <textarea v-model="content" placeholder="请输入你的回答" />
    </main>

    <footer>
      <VSwitch
        v-if="allowAnonymious"
        v-model="anonymity"
        type="checkbox"
        class="m-box m-bt1 m-bb1 m-lim-width m-pinned-row"
      >
        <slot>匿名回答</slot>
      </VSwitch>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'AnswerAdd',
  data () {
    return {
      content: '',
      anonymity: false,
    }
  },
  computed: {
    questionId () {
      return this.$route.params.questionId || 0
    },
    disabled () {
      return !this.content
    },
    allowAnonymious () {
      return this.$store.state.CONFIG.site.anonymous.status || false
    },
  },
  methods: {
    async onPost () {
      if (this.disabled) return
      const payload = {
        questionId: this.questionId,
        content: this.content.replace(/\n/g, '\n\n'),
        anonymity: this.anonymity ? 1 : 0,
      }
      await this.$store.dispatch('question/postAnswer', payload)
      this.goBack()
    },
  },
}
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
