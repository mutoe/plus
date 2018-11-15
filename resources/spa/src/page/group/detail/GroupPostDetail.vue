<template>
  <article-card
    :liked="liked"
    :loading="loading"
    @on-like="likeFeed"
    @on-share="shareFeed"
    @on-more="moreAction"
    @on-comment="commentFeed">

    <common-header slot="head">
      <avatar :user="user" size="tiny" />
      <span class="m-text-cut m-flex-none username">
        {{ user.name }}
      </span>
      <template
        v-if="!isMine"
        slot="right"
        :class="{ primary: relation.status !== 'unFollow' }" >
        <svg class="m-style-svg m-svg-def" @click="followUserByStatus(relation.status)">
          <use :xlink:href="relation.icon"/>
        </svg>
      </template>
    </common-header>

    <!-- 内容 -->
    <jo-load-more ref="loadmore" @onRefresh="fetchFeed">
      <main class="m-flex-shrink1 m-flex-grow1 m-art m-main">
        <div class="m-art-body">
          <h2 v-if="title" class="post-title">{{ title }}</h2>
          <video
            v-if="!!video"
            :poster="cover_file"
            class="feed-detail-video"
            controls
            autoplay>
            <source :src="video_file" type="video/mp4" >
          </video>
          <async-file
            v-for="img in images"
            v-if="img.file"
            :key="img.file"
            :file="img.file">
            <img
              v-if="props.src"
              slot-scope="props"
              :src="props.src"
              @click="onFileClick(img)">
          </async-file>
          <p class="m-text-box markdown-body" v-html="formatBody(feedContent)" />
        </div>
        <div class="m-box m-aln-center m-justify-bet m-art-foot">
          <div class="m-flex-grow1 m-flex-shrink1 m-art-like-list">
            <router-link
              v-if="likeCount > 0"
              tag="div"
              class="m-box m-aln-center"
              to="likers"
              append>
              <ul class="m-box m-flex-grow0 m-flex-shrink0">
                <li
                  v-for="({user = {}, id}, index) in likes.slice(0, 5)"
                  :key="id"
                  :style="{ zIndex: 5-index }"
                  :class="`m-avatar-box-${user.sex}`"
                  class="m-avatar-box tiny">
                  <img :src="getAvatar(user.avatar)">
                </li>
              </ul>
              <span>{{ likeCount | formatNum }}人点赞</span>
            </router-link>
          </div>
          <div class="m-box-model m-aln-end m-art-info">
            <span v-if="time">发布于{{ time | time2tips }}</span>
            <span>{{ feed.views_count || 0 | formatNum }}浏览</span>
          </div>
        </div>
        <div class="m-box-model m-box-center m-box-center-a m-art-reward">
          <button class="m-art-rew-btn" @click="rewardFeed">打 赏</button>
          <p class="m-art-rew-label"><a href="javascript:;">{{ reward.count | formatNum }}</a>人打赏，共<a href="javascript:;">{{ ~~reward.amount }}</a>{{ currencyUnit }}</p>
          <router-link
            tag="ul"
            to="rewarders"
            append
            class="m-box m-aln-center m-art-rew-list">
            <li
              v-for="rew in rewardList"
              :key="rew.id"
              :class="`m-avatar-box-${rew.user.sex}`"
              class="m-flex-grow0 m-flex-shrink0 m-art-rew m-avatar-box tiny">
              <img :src="getAvatar(rew.user.avatar)">
            </li>
            <li v-if="rewardList.length > 0" class="m-box m-aln-center">
              <svg class="m-style-svg m-svg-def" style="fill:#bfbfbf">
                <use xlink:href="#icon-arrow-right"/>
              </svg>
            </li>
          </router-link>
        </div>
      </main>

      <!-- 详情页广告位 -->
      <detail-ad type="group:post"/>

      <!-- 评论列表 -->
      <div id="comment_list" class="m-box-model m-art-comments">
        <ul class="m-box m-aln-center m-art-comments-tabs">
          <li>{{ commentCount | formatNum }}条评论</li>
        </ul>
        <comment-item
          v-for="(comment) in pinnedCom"
          :pinned="true"
          :key="`pinned-comment-${comment.id}`"
          :comment="comment"
          @click="replyComment"/>
        <comment-item
          v-for="(comment) in comments"
          :key="comment.id"
          :comment="comment"
          @click="replyComment"/>
        <div class="m-box m-aln-center m-justify-center load-more-box">
          <span v-if="noMoreCom" class="load-more-ph">---没有更多---</span>
          <span
            v-else
            class="load-more-btn"
            @click.stop="fetchFeedComments(maxComId)">
            {{ fetchComing ? "加载中..." : "点击加载更多" }}
          </span>
        </div>
      </div>
    </jo-load-more>
  </article-card>
</template>

<script>
import markdownIt from "markdown-it";
import plusImagePlugin from "markdown-it-plus-image";
import FeedDetail from "@/page/feed/FeedDetail.vue";
import DetailAd from "@/components/advertisement/DetailAd.vue";
import wechatShare from "@/util/wechatShare.js";
import { followUserByStatus } from "@/api/user.js";
import { limit } from "@/api";
import * as api from "@/api/group.js";

export default {
  name: "GroupPostDetail",
  components: {
    DetailAd
  },
  mixins: [FeedDetail],
  data: () => ({
    feed: {
      likes: []
    }
  }),
  computed: {
    video_file() {
      return false;
    },
    cover_file() {
      return false;
    },
    postId() {
      return this.$route.params.postId;
    },
    groupId() {
      return this.$route.params.groupId;
    },
    group() {
      return this.feed.group || {};
    },
    likes() {
      return this.feed.likes || [];
    },
    liked: {
      get() {
        return !!this.feed.liked;
      },
      set(val) {
        this.feed.liked = val;
      }
    },
    likeCount: {
      get() {
        return this.feed.likes_count || 0;
      },
      set(val) {
        this.feed.likes_count = ~~val;
      }
    },
    commentCount: {
      get() {
        return this.feed.comments_count || 0;
      },
      set(val) {
        val > 0 && (this.feed.comments_count = val);
      }
    },
    images() {
      return this.feed.images || [];
    },
    firstImage() {
      let images = this.images;
      if (!images.length) {
        return "";
      }
      const file = images[0] || {};
      return this.$http.defaults.baseURL + "/files/" + file.id + "?w=300&h=300";
    },
    feedContent() {
      const { body = "" } = this.feed;
      return body;
    },
    reward() {
      return (
        {
          amount: this.feed.reward_amount,
          count: this.feed.reward_number
        } || {}
      );
    },
    has_collect: {
      get() {
        return this.feed.collected;
      },
      set(val) {
        this.feed.collected = val;
      }
    },
    isGroupManager() {
      const { role = "" } = this.group.joined || {};
      return ["founder", "administrator"].includes(role);
    },
    relation: {
      get() {
        const relations = {
          unFollow: {
            text: "关注",
            status: "unFollow",
            icon: `#icon-unFollow`
          },
          follow: {
            text: "已关注",
            status: "follow",
            icon: `#icon-follow`
          },
          eachFollow: {
            text: "互相关注",
            status: "eachFollow",
            icon: `#icon-eachFollow`
          }
        };
        const { follower, following } = this.user;
        return relations[
          follower && following
            ? "eachFollow"
            : follower
              ? "follow"
              : "unFollow"
        ];
      },

      set(val) {
        this.user.follower = val;
      }
    }
  },
  created() {
    this.fetchFeed();
  },
  beforeMount() {
    if (this.isIosWechat) {
      this.reload(this.$router);
    }
  },
  activated() {
    if (this.postId) {
      if (this.postId !== this.oldID) {
        this.components = [];
        this.fetchFeed();
      } else {
        setTimeout(() => {
          this.loading = false;
        }, 200);
      }
    }
  },
  methods: {
    /**
     * 收藏
     * @Author   Wayne
     * @DateTime 2018-04-26
     * @Email    qiaobin@zhiyicx.com
     * @return   {[type]}            [description]
     */
    handleCollection() {
      api.collectGroupPost(this.feed.id, this.has_collect).then(() => {
        this.$Message.success("操作成功");
        this.has_collect = !this.has_collect;
      });
    },
    formatBody(body) {
      return markdownIt({
        html: true
      })
        .use(plusImagePlugin, `${this.$http.defaults.baseURL}/files/`)
        .render(body);
    },
    fetchFeed() {
      if (this.fetching) return;
      this.fetching = true;

      const shareUrl =
        window.location.origin +
        process.env.BASE_URL.substr(0, process.env.BASE_URL.length - 1) +
        this.$route.fullPath;
      const signUrl =
        this.$store.state.BROWSER.OS === "IOS" ? window.initUrl : shareUrl;

      this.$store
        .dispatch("group/getPostDetail", {
          groupId: this.groupId,
          postId: this.postId
        })
        .then(data => {
          this.feed = { ...data };
          this.user = this.feed.user;
          this.oldID = this.postId;
          this.fetching = false;
          this.fetchFeedComments();
          this.fetchRewards();
          this.fetchLikes();

          this.isWechat &&
            wechatShare(signUrl, {
              title: `${data.user.name}的动态`,
              desc: `${data.feed_content}`,
              link: shareUrl,
              imgUrl:
                data.images.length > 0
                  ? `${this.$http.defaults.baseURL}/files/${
                      data.images[0].file
                    }`
                  : ""
            });

          this.$refs.loadmore.afterRefresh();
        })
        .catch(() => {
          this.goBack();
        });
    },
    fetchRewards() {
      this.$http
        .get(`/plus-group/group-posts/${this.postId}/rewards`, {
          params: { limit: 10 }
        })
        .then(({ data = [] }) => {
          this.rewardList = data;
        });
    },
    fetchFeedComments(after = 0) {
      if (this.fetchComing) return;
      this.fetchComing = true;
      api
        .getPostComments(this.postId, { after })
        .then(({ data: { pinneds = [], comments = [] } }) => {
          if (!after) {
            this.pinnedCom = pinneds;
            // 过滤第一页中的置顶评论
            const pinnedIds = pinneds.map(p => p.id);
            this.comments = comments.filter(c => pinnedIds.indexOf(c.id) < 0);
          } else {
            this.comments = [...this.comments, ...comments];
          }

          if (comments.length) {
            this.maxComId = comments[comments.length - 1].id;
          }

          this.noMoreCom = comments.length !== limit;
          this.$nextTick(() => {
            this.loading = false;
            this.fetchComing = false;
          });
        })
        .catch(() => {
          this.loading = false;
          this.fetchComing = false;
        });
    },
    fetchLikes() {
      this.$http
        .get(
          `/plus-group/group-posts/${this.postId}/likes`,
          {
            params: { limit: 8 }
          },
          {
            validateStatus: s => s === 200
          }
        )
        .then(({ data = [] }) => {
          // this.feed.likes = data;
          this.feed = { ...this.feed, ...{ likes: data } };
        });
    },
    likeFeed() {
      api
        .likeGroupPost(this.postId, this.liked)
        .then(() => {
          !this.liked
            ? ((this.liked = true),
              (this.likeCount += 1),
              this.feed.likes.length < 5 &&
                (this.feed.likes = [
                  ...this.feed.likes,
                  {
                    user: this.CURRENTUSER,
                    id: new Date().getTime(),
                    user_id: this.CURRENTUSER.id
                  }
                ]))
            : ((this.liked = false),
              (this.likeCount -= 1),
              (this.feed.likes = this.feed.likes.filter(like => {
                return like.user_id !== this.CURRENTUSER.id;
              })));

          this.fetching = false;
        })
        .catch(() => {
          this.fetching = false;
        });
    },
    moreAction() {
      const actions = [];
      if (this.has_collect) {
        actions.push({
          text: "取消收藏",
          method: () => {
            api.uncollectPost(this.postId).then(() => {
              this.$Message.success("取消收藏");
              this.has_collect = false;
            });
          }
        });
      } else {
        actions.push({
          text: "收藏",
          method: () => {
            api.collectionPost(this.postId).then(() => {
              this.$Message.success("已加入我的收藏");
              this.has_collect = true;
            });
          }
        });
      }

      if (this.isGroupManager) {
        if (!this.feed.pinned)
          actions.push({
            text: "置顶帖子",
            method: () => {
              this.$bus.$emit("applyTop", {
                type: "post-manager",
                api: api.pinnedPost,
                payload: this.feed.id,
                callback: () => {
                  this.$Message.success("置顶成功！");
                  this.fetchFeed();
                }
              });
            }
          });
        else
          actions.push({
            text: "撤销置顶",
            method: () => {
              const actions = [
                {
                  text: "撤销置顶",
                  method: () => {
                    this.$store
                      .dispatch("group/unpinnedPost", {
                        postId: this.feed.id
                      })
                      .then(() => {
                        this.$Message.success("撤销置顶成功！");
                        this.fetchFeed();
                      });
                  }
                }
              ];
              setTimeout(() => {
                this.$bus.$emit(
                  "actionSheet",
                  actions,
                  "取消",
                  "确认撤销置顶?"
                );
              }, 200);
            }
          });
      } else if (this.isMine && !this.feed.pinned)
        actions.push({
          text: "申请帖子置顶",
          method: () => {
            this.$bus.$emit("applyTop", {
              type: "post",
              api: api.applyTopPost,
              payload: this.postId
            });
          }
        });
      if (this.isMine || this.isGroupManager) {
        actions.push({
          text: "删除帖子",
          method: () => {
            setTimeout(() => {
              const actions = [
                {
                  text: "删除",
                  style: { color: "#f4504d" },
                  method: () => {
                    this.$store
                      .dispatch("group/deletePost", {
                        groupId: this.groupId,
                        postId: this.postId
                      })
                      .then(() => {
                        this.$Message.success("删除帖子成功");
                        this.goBack();
                      });
                  }
                }
              ];
              this.$bus.$emit("actionSheet", actions, "取消", "确认删除?");
            }, 200);
          }
        });
      }
      if (!this.isMine) {
        actions.push({
          text: "举报",
          method: () => {
            this.$bus.$emit("report", {
              type: "post",
              payload: this.feed.id,
              username: this.user.name,
              reference: this.title
            });
          }
        });
      }

      this.$bus.$emit("actionSheet", actions, "取消");
    },
    // TODO: refactor 'followUserByStatus' api to vuex.action
    followUserByStatus(status) {
      if (!status || this.fetchFollow) return;
      this.fetchFollow = true;

      followUserByStatus({
        id: this.user.id,
        status
      }).then(follower => {
        this.relation = follower;
        this.fetchFollow = false;
      });
    },
    replyComment(uid, uname, commentId) {
      // 是否是自己的评论
      if (uid === this.CURRENTUSER.id) {
        // 是否是自己文章的评论
        const isOwner = uid === this.user.id;
        const actionSheet = [
          {
            text: isOwner ? "评论置顶" : "申请评论置顶",
            method: () => {
              this.$bus.$emit("applyTop", {
                isOwner,
                type: "postComment",
                api: api.applyTopPostComment,
                payload: { postId: Number(this.postId), commentId },
                callback: this.fetchFeedComments
              });
            }
          },
          { text: "删除评论", method: () => this.deleteComment(commentId) }
        ];
        this.$bus.$emit("actionSheet", actionSheet, "取消");
      } else {
        this.$bus.$emit("commentInput", {
          placeholder: `回复： ${uname}`,
          onOk: text => {
            this.sendComment({ reply_user: uid, body: text });
          }
        });
      }
    },
    sendComment({ reply_user: replyUser, body }) {
      const params = {};
      if (body && body.length > 0) {
        params.body = body;
        replyUser && (params["reply_user"] = replyUser);
        this.$http
          .post(`/plus-group/group-posts/${this.postId}/comments`, params, {
            validateStatus: s => s === 201
          })
          .then(({ data: { comment } = { comment: {} } }) => {
            this.$Message.success("评论成功");
            this.comments.unshift(comment);
            this.$bus.$emit("commentInput:close", true);
          })
          .catch(() => {
            this.$Message.error("评论失败");
            this.$bus.$emit("commentInput:close", true);
          });
      } else {
        this.$Message.error("评论内容不能为空");
      }
    },
    rewardFeed() {
      const callback = amount => {
        this.fetchRewards();
        this.feed.reward_number += 1;
        this.feed.reward_amount += amount;
      };
      this.$bus.$emit("reward", {
        type: "groupPost",
        api: api.rewardPost,
        payload: this.postId,
        callback
      });
    },
    deleteComment(commentId) {
      this.$store
        .dispatch("group/deletePostComment", { postId: this.postId, commentId })
        .then(() => {
          this.fetchFeedComments();
          this.commentCount -= 1;
          this.$Message.success("删除评论成功");
        });
    },
    getAvatar(avatar) {
      avatar = avatar || {};
      return avatar.url || null;
    }
  }
};
</script>

<style lang="less" scoped>
.post-title {
  font-size: 32px;
}
</style>
