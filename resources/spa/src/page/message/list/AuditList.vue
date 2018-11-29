<template>
  <div class="p-audit-list">
    <CommonHeader>
      <DiySelect
        v-model="currentType"
        :options="options"
        placeholder="动态评论置顶"
        style="margin-top: -1px"
      />
    </CommonHeader>

    <div class="container">
      <RouterView />
    </div>
  </div>
</template>

<script>
const prefixCls = 'auditList'
const options = [
  {
    value: 'feedcomments',
    label: '动态评论置顶',
  },
  {
    value: 'newscomments',
    label: '文章评论置顶',
  },
  {
    value: 'groupposts',
    label: '帖子置顶',
  },
  {
    value: 'groupcomments',
    label: '帖子评论置顶',
  },
  {
    value: 'groupjoins',
    label: '圈子加入申请',
  },
]
// const items = {};

export default {
  name: 'AuditList',
  data: () => ({
    prefixCls,
    refreshData: [],
    options,
    currentType: 'feedcomments',
  }),
  watch: {
    currentType (type) {
      this.$router.replace(`/message/audits/${type}`)
    },
  },
  created () {
    const regex = new RegExp('/message/audits/')
    this.currentType = this.$route.path.replace(regex, '')
  },
}
</script>

<style lang="less" scoped>
@import url("../style.less");

.p-audit-list {
  .c-common-header {
    position: fixed;
  }

  .diy-select {
    width: 10em;
  }

  .container {
    padding-top: 90px;
  }
}
</style>
