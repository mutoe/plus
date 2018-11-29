import api from '../api'

/**
 * Query questions list.
 * @author Seven Du <shiweidu@outlook.com>
 * @export
 * @param {Object} params
 * @param {string} params.type default: 'new', options: 'all', 'new', 'hot', 'reward', 'excellent'
 * @param {number} params.limit
 * @param {number} params.offset
 * @param {string} params.subject search keyword
 * @returns
 */
export function queryList (params = {}) {
  return api.get('/questions', {
    params,
    validateStatus: status => status === 200,
  })
}

/**
 * All questions.
 *
 * @param {string} type
 * @param {number} offset
 * @param {number} limit
 * @return {Promise}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function list (type, offset = 0, limit = 15) {
  return queryList({ type, limit, offset })
}

/**
 * show a question.
 *
 * @param {number} id
 * @return {Promise}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function show (id) {
  return api.get(`/questions/${id}`, {
    validateStatus: status => status === 200,
  })
}

/**
 * Watch a question.
 *
 * @param {number} id
 * @return {Promise}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function watch (id) {
  return api.put(
    `/user/question-watches/${id}`,
    {},
    {
      validateStatus: status => status === 204,
    }
  )
}

/**
 * unwatch a question.
 *
 * @param {number} id
 * @return {Promise}
 * @author Seven Du <shiweidu@outlook.com>
 */
export function unwatch (id) {
  return api.delete(`/user/question-watches/${id}`, {
    validateStatus: status => status === 204,
  })
}

/**
 * 发布问题
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {Object} params
 * @param {string} params.subject
 * @param {string} params.title
 * @param {string} params.body
 * @param {string} params.text_body
 * @param {boolean} [params.anonymity=0]
 * @param {string} [params.password]
 * @returns
 */
export function postQuestion (params) {
  return api.post('/questions', params, { validateStatus: s => s === 201 })
}

/**
 * 获取话题
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @returns
 */
export function getTopics () {
  return api.get('/question-topics', { validateStatus: s => s === 200 })
}

/**
 * 举报问题
 *
 * @author mutoe <mutoe@foxmail.com>
 * @export
 * @param {number} questionId
 * @param {string} reason
 * @returns
 */
export function reportQuestion (questionId, reason) {
  const url = `/questions/${questionId}/reports`
  return api.post(url, { reason }, { validateStatus: s => s === 201 })
}
