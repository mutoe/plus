<template>
  <div class="msgList-item" @click="showOperations(audit)">
    <div class="msgList-item-top">
      <avatar :user="audit.user" />

      <section class="userInfo">
        <router-link
          :to="`/users/${audit.user_id}`"
          class="msgList-item-top-link">{{ audit.user.name }}</router-link>
        <p>{{ audit.created_at | time2tips }}</p>
      </section>

      <div class="msgList-status">
        <section v-if="audit.audit_at">
          <section v-if="audit.status === 1" class="gray">同意</section>
          <section v-else class="red">驳回</section>
        </section>
        <section v-else class="green" >
          <span class="audit-operation">审核</span>
        </section>
      </div>
    </div>

    <p class="tips">申请加入你创建的圈子<span class="gray">"{{ group.name }}"</span>, 请及时审核。</p>

    <audit-content :audit="getAuditContent(audit)" />
  </div>
</template>

<script>
import AuditContent from "./AuditContent.vue";

export default {
  name: "GroupJoinCard",
  components: { AuditContent },
  props: {
    audit: { type: Object, required: true }
  },
  computed: {
    group() {
      return this.audit.group;
    }
  },
  methods: {
    getAuditContent(audit) {
      const { group } = audit || {};
      return {
        image: this.getGroupAvatar(group),
        commentBody: "",
        video: false,
        content: this.getGroupTitle(group),
        commentableDel: audit.group === null,
        commentDel: null,
        type: "group",
        contentId: audit.group ? group.id : 0
      };
    },
    // 获取动态第一个图片
    getGroupAvatar(group) {
      return group.avatar;
    },
    //获取动态内容
    getGroupTitle(group) {
      const { summary } = group || {};
      return summary;
    },
    accept() {
      const { group_id: group = 0, member_id: member = 0 } = this.audit;
      this.$http
        .patch(
          `/plus-group/currency-groups/${group}/members/${member}/audit`,
          { status: 1 },
          { validateStatus: s => s === 201 }
        )
        .then(({ data }) => {
          this.audit.audit_at = 1;
          this.audit.status = 1;
          this.$Message.success(data);
        });
    },
    reject() {
      const { group_id: group = 0, member_id: member = 0 } = this.audit;
      this.$http
        .patch(
          `/plus-group/currency-groups/${group}/members/${member}/audit`,
          { status: 2 },
          { validateStatus: s => s === 201 }
        )
        .then(({ data }) => {
          this.audit.audit_at = 1;
          this.audit.status = 2;
          this.$Message.success(data);
        });
    },
    showOperations(audit) {
      if (audit.status !== 0) return;

      const actions = [
        { text: "同意", method: this.accept },
        { text: "驳回", method: this.reject }
      ];
      this.$bus.$emit("actionSheet", actions);
    }
  }
};
</script>

<style lang="less" scoped>
@import url("../style.less");

.tips {
  padding-left: 97px;
  margin: 15px 0 10px;
}
</style>
