<template>
  <div v-if="show" :class="prefixCls">
    <div :class="`${prefixCls}-label`">
      <h6>{{ title }}</h6>
      <div :class="`${prefixCls}-more`" @click="to(listUrl)">
        <span>全部</span>
        <svg class="m-style-svg m-svg-small">
          <use xlink:href="#icon-arrow-right" />
        </svg>
      </div>
    </div>
    <div :class="`${prefixCls}-label`">
      <div
        v-for="user in getShow"
        :key="user.id"
        :class="`${prefixCls}-user m-aln-st`"
        @click="to(`/users/${user.id}`)"
      >
        <Avatar :class="`${prefixCls}-user-avatar`" :user="user" />
        <p class="m-flex-grow1 m-flex-shrink1 m-text-cut">{{ user.name }}</p>
      </div>
    </div>
  </div>
</template>

<script>
const prefixCls = 'rank-list-item'
export default {
  name: 'RankUsersComponent',
  props: {
    api: { type: String, required: true },
    listUrl: { type: String, required: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
  },

  data () {
    return {
      prefixCls,
      users: [],
    }
  },

  computed: {
    /**
     * 是否展示该排行模块
     * @Author   Wayne
     * @DateTime 2018-01-04
     * @Email    qiaobin@zhiyicx.com
     * @return   Boolean
     */
    show () {
      return this.users.length > 0
    },
    /**
     * 获取前个要被展示的用户
     * @Author   Wayne
     * @DateTime 2018-01-04
     * @Email    qiaobin@zhiyicx.com
     * @return   Array
     */
    getShow () {
      return this.users.slice(0, 5)
    },
  },
  activated () {
    this.getUsers()
  },

  methods: {
    to (path) {
      if (path) {
        this.$router.push({ path })
      }
    },

    getUsers () {
      this.$http
        .get(this.api, {
          validateStatus: status => status === 200,
        })
        .then(({ data = [] }) => {
          this.users = [...data]
          this.$store.commit('SAVE_RANK_DATA', { name: this.name, data })
          this.$store.commit('SAVE_USER', data)
        })
    },
  },
}
</script>

<style lang="less" scoped>
@rank-list-prefixCls: rank-list-item;

.@{rank-list-prefixCls} {
  background-color: #fff;
  & + & {
    margin-top: 8px;
  }
  &-label {
    &:nth-child(2) {
      height: 164px;
      margin-left: -30px;
      justify-content: flex-start;
      padding-bottom: 10px;
    }
    font-size: 26px;
    padding: 0 30px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h6 {
      font-size: 30px;
      color: #333;
    }
  }
  &-user {
    overflow: hidden;
    font-size: 24px;
    width: calc(~"20% - " 30px);
    margin-left: 30px;
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;

    &-avatar {
      width: 100px;
      height: 100px;
      span {
        color: #666;
        width: 100%;
        font-size: 24px;
      }
      img {
        width: 100px;
        height: 100px;
      }
    }
  }
  &-more {
    display: flex;
    align-items: center;
    span {
      margin: 0 5px;
      color: #999;
      font-size: 24px;
    }
  }

  .m-svg-small {
    color: @gray;
    width: 30px;
    height: 30px;
  }
}
</style>
