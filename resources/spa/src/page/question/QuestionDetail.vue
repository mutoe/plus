<template>
  <div class="p-question-detail">
    <CommonHeader>
      问题详情
      <span slot="right">
        <svg class="m-style-svg m-svg-def" @click="onMoreClick">
          <use xlink:href="#icon-more" />
        </svg>
      </span>
    </CommonHeader>

    <div class="container">
      <JoLoadMore
        ref="loadmore"
        @onRefresh="handleRefreshAnswers"
        @onLoadMore="handleLoadMoreAnswers"
      >
        <!-- Main -->
        <div class="main">
          <!-- Topics -->
          <div class="main-topics">
            <RouterLink
              v-for="topic in topics"
              :key="topic.id"
              :to="`/question-topics/${topic.id}`"
              class="label"
            >
              {{ topic.name }}
            </RouterLink>
          </div>

          <!-- Title -->
          <h3 class="main-title">{{ question.subject }}</h3>

          <!-- Body -->
          <div class="markdown-body" v-html="htmlBody" />

          <!-- watch -->
          <div class="main-watch">
            <div class="main-watch-count">
              <span class="follow-count">{{ question.watchers_count }}&nbsp;关注</span>
              <span v-show="question.amount">
                <span>·</span>
                <span class="shang">
                  <span>赏</span>
                  {{ question.amount }}
                </span>
              </span>
            </div>

            <!-- Watch question button -->
            <button
              v-if="question.watched"
              class="main-watch-follow active"
              @click="handleUnwatch"
            >
              <svg class="m-style-svg follow-btn">
                <use xlink:href="#icon-yes" />
              </svg>
              已关注
            </button>
            <button
              v-else
              class="main-watch-follow"
              @click="handleWatch"
            >
              <svg class="m-style-svg follow-btn">
                <use xlink:href="#icon-plus" />
              </svg>
              关注
            </button>
          </div>
        </div>

        <!-- Button -->
        <div class="main-button">
          <div class="button">
            <svg class="main-button-icon" fill="#666">
              <use :xlink:href="`#icon-question-${question.amount ? 'reward' : 'unreward'}`" />
            </svg>
            <template v-if="invitations.length">已邀请悬赏</template>
            <template v-else>{{ question.amount ? '已' : '未' }}设置悬赏</template>
          </div>

          <div
            v-if="question.my_answer"
            class="button"
            @click="gotoMyAnswer"
          >
            查看回答
          </div>
          <div
            v-else
            class="button"
            @click="addAnswer"
          >
            <svg class="main-button-icon" fill="#666">
              <use xlink:href="#icon-question-add" />
            </svg>
            添加回答
          </div>
        </div>

        <!-- Amswers -->
        <div class="answers-tool">
          <div>{{ question.answers_count }}个回答</div>
          <button @click="showOrderPopup">
            {{ answersTimeOrder ? '时间排序' : '默认排序' }}
            <svg fill="#999" class="icon">
              <use xlink:href="#icon-list" />
            </svg>
          </button>
        </div>

        <!-- Answer list -->
        <QuestionAnswerItem
          v-for="answer in answers"
          :key="answer.id"
          :answer="answer"
          @update:answer="val => updateAnswer(val)"
        />
      </JoLoadMore>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { render } from '@/util/markdown'
import * as api from '@/api/question/questions'
import { listByDefault, listByTime } from '@/api/question/answer'
import QuestionAnswerItem from './QuestionAnswerItem'

export default {
  name: 'QuestionDetail',
  components: {
    QuestionAnswerItem,
  },
  data: () => ({
    question: {},
    answersTimeOrder: false,
    answers: [],
  }),
  computed: {
    /**
     * The loged user.
     *
     * @return {Object}
     * @author Seven Du <shiweidu@outlook.com>
     */
    logedUser () {
      const { CURRENTUSER: user } = this.$store.state
      return user
    },

    /**
     * The loged user is deiter?
     *
     * @return {boolean}
     * @author Seven Du <shiweidu@outlook.com>
     */
    editer () {
      // 请不要删除，目前暂时不需要管理员可修改问题。
      // 后续需要增加的功能。
      // const { roles = [] } = this.logedUser;
      // for (let index in roles) {
      //   let role = roles[index];
      //   if (role.name === 'founder') {
      //     return true;
      //   }
      // }

      return false
    },
    topics () {
      return this.question.topics || []
    },
    htmlBody () {
      const { body = '' } = this.question
      return render(body)
    },
    answerRequestMethod () {
      return this.answersTimeOrder ? listByTime : listByDefault
    },
    invitations () {
      return this.question.invitations || []
    },
    adoptionAnswers () {
      return this.question.adoption_answers || []
    },
    invitationAnswers () {
      return this.question.invitation_answers || []
    },
  },
  watch: {
    answersTimeOrder (newRoute, oldRoute) {
      if (newRoute.path === oldRoute.path) {
        this.answers = []
        this.$refs.loadmore.beforeRefresh()
      }
    },
  },
  mounted () {
    this.$refs.loadmore.beforeRefresh()
  },
  methods: {
    refreshAnswer () {
      this.answerRequestMethod(this.$route.params.id)
        .then(({ data }) => {
          this.$refs.loadmore.afterRefresh(data.length < 15)
          this.answers = data
          // mixin adoption answers
          this.answers.unshift(...this.adoptionAnswers)
          // mixin invitation answers
          this.answers.unshift(...this.invitationAnswers)
        })
        .catch(err => {
          this.$refs.loadmore.afterRefresh()
          return Promise.reject(err)
        })
    },
    handleRefreshAnswers () {
      api
        .show(this.$route.params.id)
        .then(({ data }) => {
          this.question = data
          this.refreshAnswer()
        })
        .catch(err => {
          this.$refs.loadmore.afterRefresh()
          return Promise.reject(err)
        })
    },
    handleLoadMoreAnswers () {
      if (!this.answers.length) return
      this.answerRequestMethod(this.$route.params.id, this.answers.length)
        .then(({ data }) => {
          this.$refs.loadmore.afterLoadMore(data.length < 15)
          this.answers = [...this.answers, ...data]
        })
        .catch(({ response: { data } = {} }) => {
          this.$refs.loadmore.afterLoadMore(true)
          this.$Message.error(data)
        })
    },
    handleWatch () {
      api
        .watch(this.$route.params.id)
        .then(() => {
          this.question.watched = true
          this.question.watchers_count += 1
        })
        .catch(({ response: { data } = {} }) => {
          this.$Message.error(data)
        })
    },
    handleUnwatch () {
      api
        .unwatch(this.$route.params.id)
        .then(() => {
          this.question.watched = false
          this.question.watchers_count -= 1
        })
        .catch(({ response: { data } = {} }) => {
          this.$Message.error(data)
        })
    },
    addAnswer () {
      this.$router.push({ path: `/question/${this.question.id}/answers/add` })
    },
    gotoMyAnswer () {
      const {
        my_answer: { id = '' },
      } = this.question
      this.$router.push({
        path: `/questions/${this.question.id}/answers/${id}`,
      })
    },
    showOrderPopup () {
      const actions = [
        {
          text: '默认排序',
          method: () => {
            this.answersTimeOrder = false
          },
        },
        {
          text: '按时间排序',
          method: () => {
            this.answersTimeOrder = true
          },
        },
      ]
      this.$bus.$emit('actionSheet', actions, '取消')
    },
    onMoreClick () {
      const actions = []
      actions.push({
        text: '举报',
        method: () => {
          this.$bus.$emit('report', {
            type: 'question',
            payload: this.question.id,
            username: this.question.anonymity ? '匿名用户' : this.question.user.name,
            reference: this.question.subject,
          })
        },
      })
      this.$bus.$emit('actionSheet', actions)
    },
    updateAnswer (answer) {
      this.answers = _.unionBy([answer], this.answers, 'id')
    },
  },
}
</script>

<style lang="less" scoped>
.p-question-detail {
  .tabbar {
    position: fixed;
    z-index: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 94px;
    width: 100%;
    background-color: #fff;
    bottom: 0;
    border-top: solid 1px #d7d8d8;

    @media screen and (min-width: 769px) {
      width: 768px;
    }

    .tabbar-item {
      flex-grow: 1;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      color: #999;
      font-size: 12px;
    }

    .tabbar-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 6px;
    }
  }

  .main {
    background-color: #fff;
    padding: 30px;
    width: 100%;
    max-width: 100%;
    height: auto;

    .main-topics {
      width: 100%;
      height: auto;

      > .label {
        display: inline-block;
        background-color: #efefef;
        border-radius: 20px;
        font-size: 24px;
        color: #666;
        padding: 6px 30px;
        margin-right: 14px;
        margin-bottom: 14px;
      }
    }

    .main-title {
      font-size: 36px;
      color: #333;
      font-weight: normal;
      line-height: 1.4;
      margin: 22px 0 26px;
    }

    .main-watch {
      width: 100%;
      font-size: 26px;
      color: #999;
      margin-top: 44px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .main-watch-follow {
        height: 50px;
        background-color: #fff;
        border-radius: 8px;
        border: solid 2px @primary;
        color: @primary;
        font-size: 26px;
        font-weight: normal;
        font-stretch: normal;
        line-height: 5px;
        letter-spacing: 0px;
        outline: none;

        > span {
          width: 20px;
          height: 20px;
          font-size: 36px;
          margin-right: 2px;
          vertical-align: middle;
        }

        .follow-btn {
          color: @primary;
          width: 20px;
          height: 20px;
          vertical-align: baseline;
        }

        &.active {
          color: #ccc;
          border: solid 2px #ccc;

          .follow-btn {
            color: #ccc;
          }
        }
      }

      .main-watch-count {
        .follow-count {
          margin-right: 12px;
        }

        .shang {
          margin-left: 12px;
          color: @warning;

          > span {
            border: solid 1px currentColor;
            border-radius: 8px;
            padding: 0 4px;
            font-size: 22px;
          }
        }
      }
    }
  }

  .main-button {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    border-top: solid 1px #ededed;
    font-size: 28px;
    background-color: #fff;
    padding: 30px 0;

    > .button {
      flex: auto;
      text-align: center;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      color: #666;
      border-right: 1px solid #ededed;

      &:last-child {
        border-right: none;
      }
    }

    .main-button-icon {
      width: 30px;
      height: 30px;
      margin-top: -2px;
      margin-right: 20px;
    }
  }

  .answers-tool {
    background: @gray-bg;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 24px;
    font-weight: normal;
    font-stretch: normal;
    color: #999;
    padding: 25px 27px;

    > button {
      background-color: transparent;
      outline: none;
      color: #999;

      > .icon {
        width: 30px;
        height: 30px;
        margin-bottom: -6px;
        margin-left: 14px;
      }
    }
  }
}
</style>
