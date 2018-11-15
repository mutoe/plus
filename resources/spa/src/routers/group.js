/**
 * 圈子路由模块
 */
const GroupHome = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/GroupHome.vue");
const GroupList = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/GroupList.vue");
const UserGroups = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/UserGroups.vue");
const GroupCreate = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/GroupCreate.vue");
const GroupSearch = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/GroupSearch.vue");
const GroupPostCreate = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/GroupPostCreate.vue");
const ArticleLikes = () =>
  import(/* webpackChunkName: 'group' */ "@/page/article/ArticleLikes.vue");
const ArticleRewards = () =>
  import(/* webpackChunkName: 'group' */ "@/page/article/ArticleRewards.vue");

const GroupDetailBase = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupDetailBase.vue");
const GroupDetail = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupDetail.vue");
const GroupMembers = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupMembers.vue");
const GroupSearchPost = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupSearchPost.vue");
const GroupPostDetail = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupPostDetail.vue");
const GroupInfo = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupInfo.vue");
const GroupTransfer = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupTransfer.vue");
const GroupPermission = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupPermission.vue");
const GroupBlackList = () =>
  import(/* webpackChunkName: 'group' */ "@/page/group/detail/GroupBlackList.vue");

export default [
  {
    name: "groupHome",
    path: "/group",
    component: GroupHome,
    meta: {
      title: "圈子首页",
      keepAlive: true,
      requiresAuth: true
    }
  },
  {
    name: "groups",
    path: "/groups",
    component: GroupList,
    meta: {
      title: "全部圈子",
      requiresAuth: true
    }
  },
  {
    name: "groupSearch",
    path: "/group/search",
    component: GroupSearch,
    meta: {
      title: "搜索",
      requiresAuth: true
    }
  },
  {
    name: "groupCreate",
    path: "/group/create",
    component: GroupCreate,
    meta: {
      title: "创建圈子",
      requiresAuth: true
    }
  },
  {
    path: "/groups/:groupId(\\d+)",
    component: GroupDetailBase,
    meta: { title: "圈子详情", requiresAuth: true },
    children: [
      {
        name: "groupDetail",
        path: "",
        component: GroupDetail,
        meta: { keepAlive: true }
      },
      {
        name: "groupMembers",
        path: "members",
        component: GroupMembers,
        meta: { title: "圈子成员", sidebar: true }
      },
      {
        name: "groupSearchPost",
        path: "search",
        component: GroupSearchPost,
        meta: { title: "搜索帖子" }
      },
      {
        name: "groupPostDetail",
        path: "posts/:postId(\\d+)",
        component: GroupPostDetail,
        meta: { title: "帖子详情" }
      },
      {
        name: "groupInfo",
        path: "info",
        component: GroupInfo,
        meta: { sidebar: true }
      },
      {
        name: "groupTransfer",
        path: "transfer",
        component: GroupTransfer,
        meta: { title: "圈子转让" }
      },
      {
        name: "groupPermission",
        path: "permission",
        component: GroupPermission,
        meta: { title: "权限管理", sidebar: true }
      },
      {
        name: "groupBlackList",
        path: "blacklist",
        component: GroupBlackList,
        meta: { title: "黑名单", sidebar: true }
      }
    ]
  },
  {
    path: "/users/:userID(\\d+)/group",
    component: UserGroups,
    meta: {
      title: "TA的圈子",
      requiresAuth: true
    }
  },
  {
    name: "groupCreatePost",
    path: "/groups/create_post",
    component: GroupPostCreate,
    meta: {
      title: "发帖",
      requiresAuth: true
    }
  },

  /**
   * 点赞列表 && 打赏列表 路由格式固定
   * 帖子/资讯/问答 相关路由 统一使用 article 代替 id
   * 通过传递 不同的 meta[type] 实现组件复用
   * copy by @/routers/feed.js
   */
  {
    path: "/groups/:groupId(\\d+)/posts/:article(\\d+)/likers",
    component: ArticleLikes,
    meta: {
      title: "点赞列表",
      type: "post"
    }
  },
  {
    path: "/groups/:groupId(\\d+)/posts/:article(\\d+)/rewarders",
    component: ArticleRewards,
    meta: {
      title: "打赏列表",
      type: "post"
    }
  }
];
