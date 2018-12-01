import * as api from '@/api/wallet'
import _ from 'lodash'

const state = {
  list: [], // 充值纪录
  cashes: [], // 提现记录
}

const getters = {
  getWalletById: state => id => {
    return state.list.filter(wallet => wallet.id === id).pop() || {}
  },
  getCashesById: state => id => {
    return state.cashes.filter(wallet => wallet.id === id).pop() || {}
  },
}

const TYPES = {
  UPDATE_WALLET: 'UPDATE_WALLET',
}

const mutations = {
  [TYPES.UPDATE_WALLET] (state, payload) {
    Object.assign(state, payload)
  },
}

const actions = {
  /**
   * 获取钱包流水
   * @author mutoe <mutoe@foxmail.com>
   * @returns {Promise<Object[]>}
   */
  async getWalletOrders ({ commit, state }, params) {
    let { data } = await api.getWalletOrders(params)
    const unionList = _.unionBy([...state.list, ...data], 'id')
    commit(TYPES.UPDATE_WALLET, { list: unionList })
    return data || []
  },

  /**
   * 获取提现列表
   * @author mutoe <mutoe@foxmail.com>
   * @returns {Promise<Object[]>}
   */
  async fetchWithdrawList ({ commit }, payload) {
    const { data } = await api.getWithdrawList(payload)
    commit(TYPES.UPDATE_WALLET, { cashes: data })
    return data
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
