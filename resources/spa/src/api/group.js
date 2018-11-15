import api from "./api";
import { limit } from "./index";

/**
 * 定义圈子对象
 * @typedef {Object} GroupObject
 * @property {number} id
 * @property {string} name
 * @property {number} user_id
 * @property {number} category_id
 * @property {string} avatar
 * @property {*} ...others
 */

/**
 *  定义圈子帖子对象
 * @typedef {Object} GroupPostObject
 * @property {number} group_id
 * @property {number} user_id
 * @property {string} title
 * @property {string} summary
 * @property {number[]} images
 * @property {*} ...others
 */

/**
 * 获取圈子总数
 * @author jsonleex <jsonlseex@163.com>
 * @returns {Promise<number>}
 */
export function getGroupTotalNumber() {
  return api
    .get("/plus-group/groups/count")
    .then(({ data: { count = 0 } }) => count)
    .catch(() => {
      return 0;
    });
}

/**
 * 创建圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} categoryId
 * @param {Object} data
 * @returns
 */
export function postGroup(categoryId, data) {
  const url = `/plus-group/categories/${categoryId}/groups`;
  return api.post(url, data, { validateStatus: s => s === 200 });
}

/**
 * 获取圈子全部分类
 * @export
 * @returns
 */
export function getGroupCates() {
  return api.get("/plus-group/categories", { validateStatus: s => s === 200 });
}

/**
 * 获取我加入的圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} params
 * @param {number} params.limit
 * @param {number} params.offset
 * @param {string} params.type
 * @returns {Promise<GroupObject[]>}
 */
export function getMyGroups(params) {
  const url = "/plus-group/user-groups";
  return api.get(url, { params, validateStatus: s => s === 200 });
}

/**
 * 获取推荐圈子
 * @author jsonleex <jsonlseex@163.com>
 * @returns {Promise<Array>}
 */
export function getRecGroups() {
  return api
    .get("/plus-group/recommend/groups", {
      params: { type: "random" },
      validateStatus: s => s === 200
    })
    .then(({ data = [] }) => {
      return Array.isArray(data) ? data : [];
    })
    .catch(err => (err, []));
}

/**
 * 加入圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @returns
 */
export function joinGroup(groupId) {
  const url = `/plus-group/groups/${groupId}`;
  return api.put(url, {}, { validateStatus: s => s === 201 });
}

/**
 * 加入付费圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @returns
 */
export function joinGroupWithPaid(groupId, password) {
  const url = `/plus-group/currency-groups/${groupId}`;
  return api.put(url, { password }, { validateStatus: s => s === 201 });
}

/**
 * 获取指定用户已加入的圈子列表
 * @author jsonleex <jsonlseex@163.com>
 * @param  {number} UID
 * @returns
 */
export function getGroupsByUser(UID, limit = 15, offset = 0) {
  return api.get("/plus-group/groups/users", {
    params: { user_id: UID, limit, offset },
    validateStatus: s => s === 200
  });
}

/**
 * 全部圈子列表
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} [params]
 * @param {number} [params.limit]
 * @param {number} [params.offset]
 * @param {string} [params.keyword]
 * @param {number} [params.category_id]
 * @param {string} [params.id] 以逗号分隔的 id 字符串
 * @returns {Promise<GroupObject>}
 */
export function getGroups(params) {
  const url = `/plus-group/groups`;
  return api.get(url, { params, validateStatus: s => s === 200 });
}

/**
 * 获取推荐圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} [params]
 * @param {number} [params.limit]
 * @param {number} [params.offset]
 * @param {string} [params.type]
 * @returns {Promise<GroupObject[]>}
 */
export function getRecommendGroups(params) {
  const url = "/plus-group/recommend/groups";
  return api.get(url, { params, validateStatus: s => s === 200 });
}

/**
 * 收藏圈子帖子
 * @author jsonleex <jsonlseex@163.com>
 * @param  {number} postId
 * @param  {Boolean} status
 */
export function collectGroupPost(postId, status) {
  const url = status
    ? `/plus-group/group-posts/${postId}/uncollect`
    : `/plus-group/group-posts/${postId}/collections`;
  const method = status ? "delete" : "post";
  return api({ method, url, validateStatus: s => s === 201 || s === 204 });
}

/**
 * 收藏帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @returns
 */
export function collectionPost(postId) {
  const url = `/plus-group/group-posts/${postId}/collections`;
  return api.post(url, { validateStatus: s => s === 201 });
}

/**
 * 取消收藏帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @returns
 */
export function uncollectPost(postId) {
  const url = `/plus-group/group-posts/${postId}/uncollect`;
  return api.delete(url, { validateStatus: s => s === 204 });
}

/**
 * 获取指定圈子的圈子详情
 * @author mutoe <mutoe@foxmai.com>
 * @export
 * @param {number} groupId
 * @returns {Promise<GroupObject>}
 */
export function getGroupInfoById(groupId) {
  return api.get(`/plus-group/groups/${groupId}`, {
    validateStatus: s => s === 200
  });
}

/**
 * @export
 * @param {number} groupId
 * @param {string} [type="latest_post"]
 * @param {number} [limit=15]
 * @param {number} [offset=0]
 * @returns {Promise<{pinneds: Array, posts: Array}>}
 */
export function getGroudFeedsByType(
  groupId,
  type = "latest_post",
  limit = 15,
  offset = 0
) {
  const params = { type, offset, limit };
  return api
    .get(`/plus-group/groups/${groupId}/posts`, { params })
    .then(({ data }) => data)
    .catch(err => (err, { pinneds: [], posts: [] }));
}

/**
 * 申请帖子置顶
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {Object} params
 * @returns {Promise}
 */
export function applyTopPost(postId, params) {
  const url = `/plus-group/currency-pinned/posts/${postId}`;
  return api.post(url, params, { validateStatus: s => s === 201 });
}

/**
 * 打赏帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {Object} data
 * @param {number} data.amount 打赏金额
 * @returns
 */
export function rewardPost(postId, data) {
  const url = `/plus-group/group-posts/${postId}/new-rewards`;
  return api.post(url, data, { validateStatus: s => s === 201 });
}

/**
 * 获取帖子详情
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {number} postId
 * @returns
 */
export function getGroupPost(groupId, postId) {
  const url = `/plus-group/groups/${groupId}/posts/${postId}`;
  return api.get(url, { validateStatus: s => s === 200 });
}

/**
 * 创建帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.body
 * @param {string} data.summary
 * @param {number[]} [data.images]
 * @param {number} [data.sync_feed]
 * @param {number} [data.feed_from]
 * @returns {Promise<GroupPostObject[]>}
 */
export function createGroupPost(groupId, data) {
  const url = `/plus-group/groups/${groupId}/posts`;
  Object.assign(data, { feed_from: 2 });
  return api.post(url, data, { validateStatus: s => s === 201 });
}

/**
 * 删除帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {number} postId
 * @returns {Promise}
 */
export function deletePost(groupId, postId) {
  const url = `/plus-group/groups/${groupId}/posts/${postId}`;
  return api.delete(url, { validateStatus: s => s === 204 });
}

export function likeGroupPost(postId, status) {
  const url = `/plus-group/group-posts/${postId}/likes`;
  const method = status ? "delete" : "post";
  return api({ method, url, validateStatus: s => s === 201 || s === 204 });
}

/**
 * 获取待审核的帖子置顶申请
 * @Author   Wayne
 * @DateTime 2018-05-04
 * @Email    qiaobin@zhiyicx.com
 * @param    {number}            after [description]
 * @returns
 */
export function getPostAudits({ after = 0, group = 0 }) {
  const params = { after, limit, group };
  return api.get("/plus-group/pinned/posts", { params });
}

/**
 * 获取帖子评论
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {params} params
 * @returns
 */
export function getPostComments(postId, params) {
  const url = `/plus-group/group-posts/${postId}/comments`;
  return api.get(url, { params, validateStatus: s => s === 200 });
}

/**
 * 发表帖子评论
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {Object} payload
 * @param {string} payload.body 评论内容
 * @param {number} [payload.reply_user] 回复的用户id
 * @returns {Promise<{comment}>}
 */
export function postComment(postId, payload) {
  const url = `/plus-group/group-posts/${postId}/comments`;
  return api
    .post(url, payload, { validateStatus: s => s === 201 })
    .then(({ data = { comment: {} } }) => data.comment);
}

export function getPostCommentAudits({ after = 0, post = 0 }) {
  const params = { after, limit, post };
  return api.get("/plus-group/pinned/comments", { params });
}

/**
 * 申请评论置顶
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} params
 * @param {number} params.postId
 * @param {number} params.commentId
 * @param {Object} payload
 * @param {number} payload.amount
 * @param {number} payload.day
 * @returns
 */
export function applyTopPostComment({ postId, commentId }, payload) {
  const url = `/plus-group/currency-pinned/comments/${commentId}`;
  Object.assign(payload, { post_id: postId });
  return api.post(url, payload, { validateStatus: s => s === 201 });
}

/**
 * 删除帖子评论
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {number} commentId
 * @returns
 */
export function deletePostComment(postId, commentId) {
  const url = `/plus-group/group-posts/${postId}/comments/${commentId}`;
  return api.delete(url, { validateStatus: s => s === 204 });
}

/**
 * 搜索圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} params
 * @returns {Promise<GroupObject[]>}
 */
export function searchGroups(params) {
  return api.get("/plus-group/groups", {
    params,
    validateStatus: s => s === 200
  });
}

/**
 * 搜索帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} params
 * @param {string} params.keyword
 * @param {number} params.group_id
 * @param {number} params.limit
 * @param {number} params.offset
 * @returns {Promise<GroupPostObject[]>}
 */
export function searchPosts(params) {
  return api.get("/plus-group/group-posts", {
    params,
    validateStatus: s => s === 200
  });
}

/**
 * 获取圈子协议
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @returns {Promise<Object>}
 */
export function getProtocol() {
  return api.get("/plus-group/groups/protocol", {
    validateStatus: s => s === 200
  });
}

/**
 * 获取圈子成员
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {Object} params
 * @param {number} [params.limit=15]
 * @param {number} [params.after=0]
 * @param {string} [params.name]
 * @param {string} [params.type]
 * @returns {Promise<UserObject[]>}
 */
export function getMembers(groupId, params) {
  const url = `/plus-group/groups/${groupId}/members`;
  return api.get(url, { params, validateStatus: s => s === 200 });
}

/**
 * 退出圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @returns {Promise<null>}
 */
export function exitGroup(groupId) {
  const url = `/plus-group/groups/${groupId}/exit`;
  return api.delete(url, { validateStatus: s => s === 204 });
}

/**
 * 转让圈子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {Object} params
 * @param {number} params.target 被转让用户id
 * @returns
 */
export function transferGroup(groupId, params) {
  const url = `/plus-group/groups/${groupId}/owner`;
  return api.patch(url, params, { validateStatus: s => s === 201 });
}

/**
 * 更改圈子发帖权限
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {Object} params
 * @param {string[]} params.permissions
 * @returns
 */
export function changePermissions(groupId, params) {
  const url = `/plus-group/groups/${groupId}/permissions`;
  return api.patch(url, params, { validateStatus: s => s === 204 });
}

/**
 * 管理员置顶帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {Object} params
 * @param {number} params.day
 * @returns
 */
export function pinnedPost(postId, params) {
  const url = `/plus-group/pinned/posts/${postId}/create`;
  return api.post(url, params, { validateStatus: s => s === 201 });
}

/**
 * 管理员取消置顶帖子
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @returns
 */
export function unpinnedPost(postId) {
  const url = `/plus-group/pinned/posts/${postId}/cancel`;
  return api.patch(url, {}, { validateStatus: s => s === 201 });
}

/**
 * 将一个成员加入黑名单
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {number} memberId
 * @returns
 */
export function addToBlackList(groupId, memberId) {
  const url = `/plus-group/groups/${groupId}/blacklist/${memberId}`;
  return api.put(url, {}, { validateStatus: s => s === 201 });
}

/**
 * 将一个成员移出黑名单
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} groupId
 * @param {number} memberId
 * @returns
 */
export function moveoutBlackList(groupId, memberId) {
  const url = `/plus-group/groups/${groupId}/blacklist/${memberId}`;
  return api.delete(url, { validateStatus: s => s === 204 });
}

/**
 * 举报帖子
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} postId
 * @param {string} reason 举报理由
 * @returns
 */
export function reportPost(postId, reason) {
  const url = `/plus-group/reports/posts/${postId}`;
  return api.post(url, { content: reason }, { validateStatus: s => s === 201 });
}

/**
 * 举报评论
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} commentId
 * @param {string} reason
 * @returns
 */
export function reportPostComment(commentId, reason) {
  const url = `/plus-group/reports/comments/${commentId}`;
  return api.post(url, { content: reason }, { validateStatus: s => s === 201 });
}
