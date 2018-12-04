<template>
  <div class="p-question-answer-item" @click="viewDetail">
    <div class="main">
      <div class="avatar" @click.stop="viewUser">
        <Avatar :anonymity="anonymity" :user="user" />
      </div>
      <div class="info">
        <h3 class="main-header">
          <span :class="{adoption: answer.adoption, invited: answer.invited}" class="name">
            <template v-if="!anonymity" @click.stop="viewUser">{{ user.name }}</template>
            <template v-else-if="!isMine">匿名用户</template>
            <template v-else>{{ user.name }} <span class="gray">(匿名)</span></template>
          </span>
          <span class="time">{{ answer.created_at | time2tips }}</span>
        </h3>
        <div
          v-if="answer.could !== false"
          class="main-body"
          v-html="body"
        />
        <div v-else class="main-body needPay" />
      </div>
    </div>
    <div class="main-button">
      <span @click.stop="handleLikeTarget">
        <svg class="icon">
          <use :xlink:href="answer.liked ? '#icon-like' : '#icon-unlike'" />
        </svg>
        {{ answer.likes_count | formatNum }}
      </span>
      <span>
        <svg class="icon">
          <use xlink:href="#icon-comment" />
        </svg>
        {{ answer.comments_count | formatNum }}
      </span>
    </div>
  </div>
</template>

<script>
import * as api from '@/api/question/answer'

export default {
  name: 'QuestionAnswerItem',
  props: {
    answer: { type: Object, required: true },
  },
  data: () => ({
    likeTargetHanding: false,
  }),
  computed: {
    isInvited () {
      return this.answer.invited
    },
    onlookersAmount () {
      return this.$store.state.CONFIG['Q&A'].onlookers_amount || 0
    },
    anonymity () {
      const { anonymity } = this.answer
      return !!anonymity
    },
    user () {
      const { user = {} } = this.answer
      return user
    },
    body () {
      const body = this.answer.body || ''
      return body.replace(/@!\[image]\(\d+\)/g, '[图片]')
    },
    isMine () {
      return this.user.id === this.$store.state.CURRENTUSER.id
    },
  },
  methods: {
    handleLike () {
      api.like(this.answer.id)
        .then(() => {
          this.likeTargetHanding = false
          this.answer.liked = true
          this.answer.likes_count += 1
        })
        .catch(({ response: { data } = {} }) => {
          this.likeTargetHanding = false
          this.$Message.error(data)
        })
    },
    handleUnlike () {
      api.unlike(this.answer.id)
        .then(() => {
          this.likeTargetHanding = false
          this.answer.liked = false
          this.answer.likes_count -= 1
        })
        .catch(({ response: { data } = {} }) => {
          this.likeTargetHanding = false
          this.$Message.error(data)
        })
    },
    handleLikeTarget () {
      if (this.likeTargetHanding) {
        this.$Message.warning('正在执行，请勿重复点击!')
        return
      } else if (this.answer.liked) {
        this.handleUnlike()
        return
      }
      this.handleLike()
    },
    viewDetail () {
      if (!this.isInvited || this.answer.could) {
        return this.$router.push({
          name: 'answerDetail',
          params: { questionId: this.answer.question_id, answerId: this.answer.id },
        })
      }
      this.$bus.$emit('payfor', {
        title: '围观支付',
        content: `你只需支付 ${this.onlookersAmount} 积分即可围观该回答`,
        confirmText: '支付',
        amount: this.onlookersAmount,
        onOk: this.onlookers,
        checkPassword: true,
      })
    },
    onlookers (password) {
      api.onlookersAnswer(this.answer.id, password)
        .then(({ data }) => {
          const { answer } = data
          this.$emit('update:answer', answer)
          this.$Message.success('支付成功！')
        })
        .catch(({ response }) => {
          this.$Message.error(response.data.message)
        })
    },
    viewUser () {
      if (!this.user.id) return
      this.$router.push(`/users/${this.user.id}`)
    },
  },
}
</script>

<style lang="less" scoped>
@avatar-size: 112px;

.p-question-answer-item {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  margin-bottom: 9px;

  .main {
    display: flex;
    width: 100%;
    padding: 30px 30px 20px 0;

    .avatar {
      width: @avatar-size;
      min-width: @avatar-size;
      max-width: @avatar-size;
      flex: none;
      text-align: center;
    }

    .info {
      display: flex;
      flex-direction: column;
      width: 100%;

      .main-header {
        display: flex;
        justify-content: space-between;
        width: 100%;
        font-size: 26px;
        font-weight: normal;
        font-stretch: normal;
        color: #333;
        margin-top: 0;
        margin-bottom: 29px;

        .name {
          display: flex;
          align-items: center;
          color: #666;

          &::after {
            border: 1px solid currentColor;
            border-radius: 8px;
            font-size: 22px;
            padding: 0 4px;
            margin-left: 12px;
          }

          &.invited::after {
            content: "邀请回答";
            color: @primary;
          }

          &.adoption::after {
            content: "已采纳";
            color: @success;
          }
        }

        .time {
          font-size: 24px;
          font-weight: normal;
          font-stretch: normal;
          color: #ccc;
        }
      }

      .main-body {
        text-align: initial;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        font-size: 28px;
        font-weight: normal;
        font-stretch: normal;
        color: #666;
        margin-bottom: 28px;
        line-height: 1.4;

        &.needPay::after {
          content: " 该答案需要付费才能围观 need paid 该答案需要付费才能围观 need paid 该答案需要付费才能围观 need paid";
          text-shadow: 0 0 10px @text-color2; /* no */
          color: rgba(255, 255, 255, 0);
          margin-left: 5px;
          // filter: DXImageTransform.Microsoft.Blur(pixelradius=2);
          zoom: 1;
        }
      }
    }
  }

  .main-button {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-top: solid 1px #ededed;
    padding: 30px;
    padding-left: @avatar-size;

    > * {
      margin-right: 60px;
      font-size: 24px;
      font-weight: normal;
      font-stretch: normal;
      color: #b3b3b3;

      .icon {
        margin-right: 4px;
        width: 30px;
        height: 30px;
        margin-bottom: -6px;
        fill: #999;

        &.active {
          fill: red;
        }
      }
    }
  }
}

.gray {
  color: #ccc;
}
</style>
