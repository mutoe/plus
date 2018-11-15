<template>
  <div class="msgList-status">
    <section v-if="audit.expires_at">
      <section v-if="audit.status === 1" class="gray">
        <span class="amount-show">{{ audit.amount }}{{ currencyUnit }} / {{ audit.day }}天</span>同意置顶
      </section>
      <section v-else class="gray">
        <span class="amount-show">{{ audit.amount }}{{ currencyUnit }} / {{ audit.day }}天</span>拒绝置顶
      </section>
    </section>
    <section
      v-else
      class="green"
      @click="showOperations(audit)">
      <span class="audit-show">{{ audit.amount }}{{ currencyUnit }} / {{ audit.day }}天</span>
      <span class="audit-operation">审核</span>
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
      const { target: postId = 0 } = this.audit;
      this.$http
        .patch(`/plus-group/currency-pinned/posts/${postId}/accept`, {
          validateStatus: s => s === 201
        })
        .then(({ data }) => {
          this.audit.expires_at = 1;
          this.audit.status = 1;
          this.$Message.success(data);
        });
    },
    reject() {
      const { target: postId = 0 } = this.audit;
      this.$http
        .patch(`/plus-group/currency-pinned/posts/${postId}/reject`, {
          validateStatus: s => s === 201
        })
        .then(({ data }) => {
          this.audit.expires_at = 1;
          this.audit.status = 2;
          this.$Message.success(data);
        });
    }
  }
};
</script>

<style lang="less">
@import url("../style.less");
</style>
