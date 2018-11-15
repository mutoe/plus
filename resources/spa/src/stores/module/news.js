import * as api from "@/api/news";
import * as bootApi from "@/api/bootstrappers";
import lstore from "@/plugins/lstore/lstore";

const state = {
  /** 资讯卡片广告 */
  advertise: {
    type: 0, //  广告类型 ID
    list: lstore.getData("ADVERTISEMENT_NEWS") || [], // 广告列表
    index: 0 // 当前插入广告位索引
  }
};

const getters = {};

const TYPES = {
  SAVE_ADVERTISE: "SAVE_ADVERTISE",
  POPUP_ADVERTISE: "POPUP_ADVERTISE",
  RESET_ADVERTISE: "RESET_ADVERTISE"
};

const mutations = {
  [TYPES.SAVE_ADVERTISE](state, payload) {
    lstore.setData("ADVERTISEMENT_NEWS", payload);
    state.advertise.list = payload;
  },

  [TYPES.POPUP_ADVERTISE](state) {
    state.advertise.index++;
  },

  [TYPES.RESET_ADVERTISE](state) {
    state.advertise.index = 0;
  }
};

const actions = {
  async getAdvertise({ state, commit, rootGetters }) {
    if (!state.advertise.type) {
      const adType = rootGetters.getAdTypeBySpace("news:list:analog");
      state.advertise.type = adType.id;
    }
    const { data } = await bootApi.getAdsById(state.advertise.type);
    commit(TYPES.SAVE_ADVERTISE, data);
    return data;
  },

  /**
   * 获取资讯列表
   * @author mutoe <mutoe@foxmail.com>
   * @returns {api.NewsObject[]}
   */
  async getNewsList(state, params) {
    Object.assign(params, { limit: 10 });
    const { data } = await api.getNewsList(params);
    return data || [];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
