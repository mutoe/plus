import api from '../api.js'

/**
 * List answers by default
 *
 * @param {number} question
 * @param {Number} offset
 * @param {Number} limit
 * @return {Promise}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function listByDefault (question, offset = 0, limit = 15) {
  return api.get(`/questions/${question}/answers`, {
    params: { offset, limit, order_type: 'default' },
    validateStatus: status => status === 200,
  })
}

/**
 * List answers by time.
 *
 * @param {number} question
 * @param {Number} offset
 * @param {Number} limit
 * @return {Promise}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function listByTime (question, offset = 0, limit = 15) {
  return api.get(`/questions/${question}/answers`, {
    params: { offset, limit, order_type: 'time' },
    validateStatus: status => status === 200,
  })
}

/**
 * 点赞回答
 * @author Seven Du <shiweidu@outlook.com>
 * @param {number} answerId
 * @returns
 */
export function like (answerId) {
  const url = `/question-answers/${answerId}/likes`
  return api.post(url, {}, { validateStatus: s => s === 201 })
}

/**
 * 取消点赞
 * @author Seven Du <shiweidu@outlook.com>
 * @param {number} answerId
 * @returns
 */
export function unlike (answerId) {
  const url = `/question-answers/${answerId}/likes`
  return api.delete(url, { validateStatus: s => s === 204 })
}

/**
 * 收藏回答
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @returns
 */
export function collect (answerId) {
  const url = `/user/question-answer/collections/${answerId}`
  return api.post(url, {}, { validateStatus: s => s === 201 })
}

/**
 * 取消收藏回答
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @returns
 */
export function unCollect (answerId) {
  const url = `/user/question-answer/collections/${answerId}`
  return api.delete(url, { validateStatus: s => s === 204 })
}

/**
 * 获取回答
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @returns
 */
export function getAnswer (answerId) {
  const url = `/question-answers/${answerId}`
  return api.get(url, { validateStatus: s => s === 200 })
}

/**
 * 获取回答评论
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @param {Object} params
 * @param {number} [params.limit=20]
 * @param {number} [params.after=0]
 * @returns
 */
export function getAnswerComments (answerId, params) {
  const url = `/question-answers/${answerId}/comments`
  return api.get(url, { params, validateStatus: s => s === 200 })
}

/**
 * 添加回答
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} questionId
 * @param {Object} data
 * @param {string} data.body
 * @param {string} [data.text_body]
 * @param {number} [data.anonymity] 1: 匿名 0: 不匿名
 * @returns
 */
export function postAnswer (questionId, data) {
  const url = `/questions/${questionId}/answers`
  return api.post(url, data, {
    validateStatus: s => s === 201,
  })
}

/**
 * 打赏回答
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @param {Object} payload
 * @param {number} payload.amount 打赏金额
 * @returns
 */
export function rewardAnswer (answerId, payload) {
  const url = `/question-answers/${answerId}/new-rewards`
  return api.post(url, payload, { validateStatus: s => s === 200 })
}

/**
 * 获取打赏列表
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @param {Object} params
 * @param {string} [params.type = 'time'] time 按时间倒序 amount 按金额倒序
 * @param {number} [params.limit = 20] limit
 * @param {number} [params.offset = 0] offset
 * @returns
 */
export function getRewards (answerId, params) {
  const url = `/question-answers/${answerId}/rewarders`
  return api.get(url, { params, validateStatus: s => s === 200 })
}

/**
 * 删除评论
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @param {number} commentId
 * @returns
 */
export function deleteAnswerComment (answerId, commentId) {
  const url = `/question-answers/${answerId}/comments/${commentId}`
  return api.delete(url, { validateStatus: s => s === 204 })
}

/**
 * 举报答案
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} answerId
 * @param {string} reason
 * @returns
 */
export function reportAnswer (answerId, reason) {
  const url = `/question-answers/${answerId}/reports`
  return api.post(url, { reason }, { validateStatus: s => s === 201 })
}
