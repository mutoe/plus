<template>
  <div class="msgList-status">
    <section v-if="audit.comment">
      <section v-if="audit.expires_at !== null">
        <section v-if="audit.state === 1" class="gray">
          <span class="amount-show">{{ audit.amount }}分 / {{ audit.day }}天</span>同意置顶
        </section>
        <section v-else class="gray">
          <span class="amount-show">{{ audit.amount }}分 / {{ audit.day }}天</span>拒绝置顶
        </section>
      </section>
      <section
        v-if="audit.expires_at === null"
        class="green"
        @click="showOperations(audit)">
        <span class="audit-show">{{ audit.amount }}分 / {{ audit.day }}天</span>
        <span class="audit-operation">审核</span>
      </section>
    </section>
    <section v-if="!audit.comment" class="red">
      该评论已被删除
    </section>
  </div>
</template>

<script>
/**
 * 提取资讯评论置顶申请的状态控制组件
 */

import AuditStatusBase from "./AuditStatusBase.vue";

export default {
  name: "NewsCommentAuditStatus",
  extends: AuditStatusBase,
  methods: {
    accept() {
      const {
        raw: commentId = 0,
        target: newsId = 0,
        id: pinnedId = 0
      } = this.audit;
      this.$http
        .patch(
          `/news/${newsId}/comments/${commentId}/currency-pinneds/${pinnedId}`,
          { validateStatus: s => s === 201 }
        )
        .then(({ data }) => {
          this.audit.state = 1;
          this.audit.expires_at = 1;
          this.$Message.success(data);
        });
    },
    reject() {
      const {
        id: pinnedId = 0,
        raw: commentId = 0,
        target: newsId = 0
      } = this.audit;
      this.$http
        .patch(
          `/news/${newsId}/comments/${commentId}/currency-pinneds/${pinnedId}/reject`,
          { validateStatus: s => s === 204 }
        )
        .then(() => {
          this.audit.state = 2;
          this.audit.expires_at = 1;
          this.$Message.success("已拒绝置顶");
        });
    }
  }
};
</script>

<style lang="less">
@import url("../style.less");

.gray {
  span {
    margin-right: 30px;
  }
}
</style>
