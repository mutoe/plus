import * as api from '@/api/currency'
import * as walletApi from '@/api/wallet'

const state = {
  unit: '积分',
}

const TYPES = {
  UPDATE_CURRENCY_UNIT: 'UPDATE_CURRENCY_UNIT',
}

const mutations = {

  [TYPES.UPDATE_CURRENCY_UNIT] (state, payload) {
    const { unit } = payload
    unit && (state.unit = unit)
  },
}

const actions = {
  /**
   * 更新积分单位
   * @author mutoe <mutoe@foxmail.com>
   * @param {*} { commit, rootState }
   */
  updateCurrencyUnit ({ commit, rootState }) {
    const { currency_name: currency } = rootState.CONFIG.site
    commit(TYPES.UPDATE_CURRENCY_UNIT, { unit: currency.name })
  },

  /**
   * 获取积分流水
   * @author mutoe <mutoe@foxmail.com>
   * @returns {Promise<Object[]>}
   */
  async getCurrencyOrders (state, payload) {
    const { data = [] } = await api.getCurrencyOrders(payload)
    return data
  },

  /**
   * 发起提现请求
   * @author mutoe <mutoe@foxmail.com>
   * @param {number} amount
   * @returns {Promise<{message: string[]}>}
   */
  async requestWithdraw (state, amount) {
    const { data } = await api.postCurrencyWithdraw({ amount })
    return data
  },

  /**
   * 积分转换为余额
   * @author mutoe <mutoe@foxmail.com>
   * @param {number} amount
   * @returns {Promise<{message: string[]}>}
   */
  async currency2wallet (state, amount) {
    return walletApi.postTransform({ amount }).catch(err => err.response.data)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
