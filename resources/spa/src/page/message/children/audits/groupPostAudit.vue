<template>
  <div :class="`${prefixCls}`">
    <div :class="`${prefixCls}-container`">
      <jo-load-more
        ref="loadmore"
        :class="`${prefixCls}-loadmore`"
        @onRefresh="onRefresh"
        @onLoadMore="onLoadMore" >
        <div
          v-for="audit in audits"
          :class="`${prefixCls}-item`"
          :key="`group-post-${audit.id}`">
          <div :class="`${prefixCls}-item-top`">
            <avatar :user="audit.user" />
            <section class="userInfo">
              <router-link :class="`${prefixCls}-item-top-link`" :to="`/users/${audit.user_id}`">
                {{ audit.user.name }}
              </router-link>
              <p>{{ audit.created_at | time2tips }}</p>
            </section>
            <audit-status-group-post :audit="audit" />
          </div>
          <div :class="`${prefixCls}-item-bottom`">
            <div
              v-if="audit.post !== null"
              class="content"
              @click="goToDetail(audit.news.id)">
              对帖子“<span>{{ audit.post.title }}</span>”申请置顶,请及时审核
            </div>
            <div v-else class="content red">
              帖子已被删除
            </div>
          </div>
        </div>
      </jo-load-more>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { mapState } from "vuex";
import { limit } from "@/api";
import { getPostAudits } from "@/api/group.js";
import AuditStatusGroupPost from "../../components/AuditStatusGroupPost.vue";

const prefixCls = "msgList";

export default {
  name: "GroupPostAudit",
  components: {
    AuditStatusGroupPost
  },
  data: () => ({
    prefixCls
  }),
  computed: {
    ...mapState({
      audits: state => state.MESSAGE.MY_POST_AUDIT
    })
  },
  methods: {
    goToDetail(id) {
      this.$router.push(`/groups//${id}`);
    },
    onRefresh() {
      getPostAudits({}).then(({ data }) => {
        if (data.length > 0) {
          this.$store.commit("SAVE_GROUP_POST_AUDITS", { type: "new", data });
        }
        this.$refs.loadmore.afterRefresh(data.length < limit);
      });
    },
    onLoadMore() {
      const { id = 0 } = _.head(this.audits) || {};
      if (id === 0) {
        this.$refs.loadmore.afterLoadMore(true);
        return false;
      }

      getPostAudits({ after: id }).then(({ data }) => {
        this.$refs.loadmore.afterLoadMore(data.length < limit);
        if (data.length > 0) {
          this.$store.commit("SAVE_GROUP_POST_AUDITS", { type: "more", data });
        }
      });
    }
  }
};
</script>

<style lang="less" src="../../style.less">
</style>
