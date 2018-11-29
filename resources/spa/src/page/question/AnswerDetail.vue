<template>
  <ArticleCard
    v-if="answer.id"
    :liked="liked"
    :loading="loading"
    class="p-answer-detail"
    @on-like="likeAnswer"
    @on-share="shareAnswer"
    @on-more="moreAction"
    @on-comment="commentAnswer"
  >
    <CommonHeader slot="head">{{ answer.question.subject }}</CommonHeader>

    <main class="m-flex-shrink1 m-flex-grow1 m-art m-main">
      <!-- 回答者信息 -->
      <div class="user-info-wrap">
        <Avatar :anonymity="answer.anonymity" :user="user" />
        <div class="user-info">
          <h2 v-if="isMine || !answer.anonymity" class="m-text-cut">{{ user.name }} <span v-if="answer.anonymity" class="gray">(匿名)</span></h2>
          <h2 v-else class="m-text-cut">匿名用户</h2>
          <p v-if="isMine || !answer.anonymity" class="m-text-cut">{{ user.bio || "这家伙很懒,什么也没留下" }}</p>
        </div>
        <template v-if="!isMine && !answer.anonymity" :class="{ primary: user.follower }">
          <span
            v-if="!user.follower"
            class="actived"
            @click="followUser(true)"
          >
            <svg class="m-style-svg follow-btn">
              <use xlink:href="#icon-plus" />
            </svg>
            关注
          </span>
          <span v-else @click="followUser(false)">
            <svg class="m-style-svg follow-btn">
              <use xlink:href="#icon-yes" />
            </svg>
            已关注
          </span>
        </template>
      </div>
      <div class="m-art-body">
        <p class="m-text-box markdown-body" v-html="formatBody(content)" />
      </div>
      <div class="m-box m-aln-center m-justify-bet m-art-foot">
        <RouterLink
          class="m-flex-grow1 m-flex-shrink1 m-box m-aln-center m-art-like-list"
          tag="div"
          to="likers"
          append
        >
          <ul class="m-box m-flex-grow0 m-flex-shrink0 mr10">
            <li
              v-for="({userItem = {}, id}, index) in likes.slice(0, 5)"
              :key="id"
              :style="{ zIndex: 5-index }"
              :class="`m-avatar-box-${userItem.sex}`"
              class="m-avatar-box tiny"
            >
              <img :src="getAvatar(userItem.avatar)">
            </li>
          </ul>
          <span v-if="likeCount">{{ likeCount | formatNum }} 人点赞</span>
        </RouterLink>
        <div class="m-box-model m-aln-end m-art-info">
          <span>发布于{{ time | time2tips }}</span>
          <span>{{ viewsCount | formatNum }}浏览</span>
        </div>
      </div>
      <div class="m-box-model m-box-center m-box-center-a m-art-reward">
        <button class="m-art-rew-btn" @click="rewardAnswer">打 赏</button>
        <p class="m-art-rew-label">
          <a href="javascript:;">{{ reward.count | formatNum }}</a> 人打赏，共
          <a href="javascript:;">{{ ~~reward.amount }}</a> {{ currencyUnit }}
        </p>
        <RouterLink
          tag="ul"
          to="rewarders"
          append
          class="m-box m-aln-center m-art-rew-list"
        >
          <li
            v-for="rew in rewardList"
            :key="rew.id"
            :class="`m-avatar-box-${rew.user.sex}`"
            class="m-flex-grow0 m-flex-shrink0 m-art-rew m-avatar-box tiny"
          >
            <img :src="getAvatar(rew.user.avatar)">
          </li>
          <li v-if="rewardList.length > 0" class="m-box m-aln-center">
            <svg class="m-style-svg m-svg-def" style="fill:#bfbfbf">
              <use xlink:href="#icon-arrow-right" />
            </svg>
          </li>
        </RouterLink>
      </div>
    </main>
    <!-- 评论列表 -->
    <div id="comment_list" class="m-box-model m-art-comments">
      <ul class="m-box m-aln-center m-art-comments-tabs">
        <li>{{ commentCount | formatNum }}条评论</li>
      </ul>
      <CommentItem
        v-for="(comment) in pinnedCom"
        :key="`pinned-comment-${comment.id}`"
        :pinned="true"
        :comment="comment"
        @click="replyComment"
      />
      <CommentItem
        v-for="(comment) in comments"
        :key="comment.id"
        :comment="comment"
        @click="replyComment"
      />
      <div class="m-box m-aln-center m-justify-center load-more-box">
        <span v-if="noMoreCom" class="load-more-ph">---没有更多---</span>
        <span
          v-else
          class="load-more-btn"
          @click.stop="fetchAnswerComments(maxComId)"
        >
          {{ fetchComing ? "加载中..." : "点击加载更多" }}
        </span>
      </div>
    </div>
  </ArticleCard>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import markdownIt from 'markdown-it'
import plusImagePlugin from 'markdown-it-plus-image'
import ArticleCard from '@/page/article/ArticleCard.vue'
import CommentItem from '@/page/article/ArticleComment.vue'
import { limit } from '@/api'
import * as api from '@/api/question/answer'
import * as userApi from '@/api/user'

export default {
  name: 'AnswerDetail',
  components: {
    ArticleCard,
    CommentItem,
  },
  data () {
    return {
      loading: false,
      fetching: false,

      answer: {},

      comments: [],
      pinnedCom: [],
      rewardList: [],
      reward: {
        count: 0,
        amount: 0,
      },

      fetchComing: false,
      fetchFollow: false,
      noMoreCom: false,
      maxComId: 0,
    }
  },
  computed: {
    ...mapState(['CURRENTUSER']),
    questionId () {
      return this.$route.params.questionId
    },
    answerId () {
      return this.$route.params.answerId
    },
    user () {
      return this.answer.user || {}
    },
    time () {
      return this.answer.created_at || ''
    },
    liked: {
      get () {
        return !!this.answer.liked
      },
      set (val) {
        this.answer.liked = val
      },
    },
    likes () {
      return this.answer.likes || []
    },
    collected: {
      get () {
        return this.answer.collected
      },
      set (val) {
        this.answer.collected = val
      },
    },
    likeCount: {
      get () {
        return this.answer.likes_count || 0
      },
      set (val) {
        this.answer.likes_count = ~~val
      },
    },
    viewsCount () {
      return this.answer.views_count || 0
    },
    commentCount: {
      get () {
        return this.answer.comments_count || 0
      },
      set (val) {
        this.answer.comments_count = ~~val
      },
    },
    content () {
      const { body = '' } = this.answer
      return body
    },
    isMine () {
      return this.user.id === this.CURRENTUSER.id
    },
    isWechat () {
      return this.$store.state.BROWSER.isWechat
    },
  },
  created () {
    this.fetchAnswer()
  },
  methods: {
    getAvatar (avatar) {
      avatar = avatar || {}
      return avatar.url || null
    },
    formatBody (body) {
      return markdownIt({
        html: true,
      })
        .use(plusImagePlugin, `${this.$http.defaults.baseURL}/files/`)
        .render(body)
    },
    likeAnswer () {
      if (this.fetching) return
      this.fetching = true
      if (this.liked) {
        api
          .unlike(this.answerId)
          .then(() => {
            this.liked = false
            this.likeCount -= 1
            this.answer.likes = this.answer.likes.filter(like => {
              return like.user_id !== this.CURRENTUSER.id
            })
          })
          .finally(() => {
            this.fetching = false
          })
      } else {
        api
          .like(this.answerId)
          .then(() => {
            this.liked = true
            this.likeCount += 1
            if (this.answer.likes.length < 5) {
              this.answer.likes.push({
                user: this.CURRENTUSER,
                id: +new Date(),
                user_id: this.CURRENTUSER.id,
              })
            }
          })
          .finally(() => {
            this.fetching = false
          })
      }
    },
    shareAnswer () {
      if (this.isWechat) this.$Message.success('请点击右上角微信分享😳')
      else this.$Message.success('请使用浏览器的分享功能😳')
    },
    commentAnswer () {
      this.$bus.$emit('commentInput', {
        onOk: text => {
          this.sendComment({ body: text })
        },
      })
    },
    rewardAnswer () {
      const callback = amount => {
        this.fetchRewards()
        this.reward.count += 1
        this.reward.amount += amount
      }
      this.$bus.$emit('reward', {
        type: 'answer',
        api: api.rewardAnswer,
        payload: this.answerId,
        callback,
      })
    },
    moreAction () {
      const actions = []
      if (!this.collected) {
        actions.push({
          text: '收藏',
          method: () => {
            api.collect(this.answerId).then(() => {
              this.collected = true
              this.$Message.success('收藏成功')
            })
          },
        })
      } else {
        actions.push({
          text: '取消收藏',
          method: () => {
            api.unCollect(this.answerId).then(() => {
              this.collected = false
              this.$Message.success('取消收藏')
            })
          },
        })
      }
      if (!this.isMine) {
        actions.push({
          text: '举报',
          method: () => {
            this.$bus.$emit('report', {
              type: 'answer',
              payload: this.answerId,
              username: this.answer.user.name,
              reference: this.answer.body,
            })
          },
        })
      }
      this.$bus.$emit('actionSheet', actions)
    },
    fetchRewards () {
      api.getRewards(this.answerId, { limit: 10 }).then(({ data }) => {
        this.rewardList = data
      })
    },
    fetchAnswer () {
      if (this.loading) return
      this.loading = true

      api.getAnswer(this.answerId).then(({ data }) => {
        this.answer = data
        this.reward.count = data.rewarder_count
        this.reward.amount = data.rewards_amount
        this.rewardList = data.rewarders
        this.fetchAnswerComments()
        this.loading = false
      })
    },
    fetchAnswerComments (after = 0) {
      if (this.fetchComing) return
      this.fetchComing = true
      api
        .getAnswerComments(this.answerId, { limit, after })
        .then(({ data: comments = [] }) => {
          if (comments && comments.length) {
            this.comments = after ? [...this.comments, ...comments] : comments
            this.maxComId = comments[comments.length - 1].id
          }
          this.noMoreCom = comments.length < 15
        })
        .finally(() => {
          this.$nextTick(() => {
            this.fetchComing = false
            this.loading = false
          })
        })
    },
    replyComment (uid, uname, commentId) {
      uid === this.CURRENTUSER.id
        ? this.$bus.$emit(
          'actionSheet',
          [
            {
              text: '删除评论',
              method: () => {
                this.deleteAnswerComment(commentId)
              },
            },
          ],
          '取消'
        )
        : this.$bus.$emit('commentInput', {
          placeholder: `回复： ${uname}`,
          onOk: text => {
            this.sendComment({ reply_user: uid, body: text })
          },
        })
    },
    sendComment ({ reply_user: replyUser, body }) {
      // 评论答案
      // POST /question-answers/:answer/comments
      const params = {}
      if (body && body.length > 0) {
        params.body = body
        replyUser && (params['reply_user'] = replyUser)
        this.$http
          .post(`/question-answers/${this.answerId}/comments`, params, {
            validateStatus: s => s === 201,
          })
          .then(({ data: { comment } = { comment: {} } }) => {
            this.$Message.success('评论成功')
            this.comments.unshift(comment)
            this.commentCount += 1
            this.$bus.$emit('commentInput:close', true)
          })
          .catch(() => {
            this.$Message.error('评论失败')
            this.$bus.$emit('commentInput:close', true)
          })
      } else {
        this.$Message.error('评论内容不能为空')
      }
    },
    deleteAnswerComment (commentId) {
      api.deleteAnswerComment(this.answerId, commentId).then(() => {
        this.$Message.success('删除评论成功')
        _.remove(this.comments, c => c.id === commentId)
        this.commentCount -= 1
        this.$bus.$emit('commentInput:close', true)
      })
    },
    followUser (status) {
      if (this.fetchFollow) return
      this.fetchFollow = true
      status = status ? 'unFollow' : 'follow'

      userApi.followUserByStatus({ id: this.user.id, status }).then(() => {
        this.fetchFollow = false
        this.user.follower = !this.user.follower
      })
    },
  },
}
</script>

<style lang="less" scoped>
.p-answer-detail {
  .user-info-wrap {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 20px;
    height: 120px;
    border-bottom: 1px solid #ededed;

    .user-info {
      flex: auto;
      margin-left: 20px;
      font-size: 26px;
      overflow: hidden;

      .gray,
      > p {
        color: #999;
      }

      + span {
        flex: none;
        border: 1px solid #ccc;
        color: #ccc;
        border-radius: 10px;
        font-size: 28px;
        padding: 4px 10px;
        display: inline-block;
        width: 5em;
        text-align: center;

        .follow-btn {
          color: #ccc;
          width: 20px;
          height: 20px;
          vertical-align: baseline;
        }

        &.actived {
          color: @primary;
          border-color: @primary;

          .follow-btn {
            color: @primary;
          }
        }
      }
    }
  }
}
</style>
