import * as api from "@/api/feeds";
import * as bootApi from "@/api/bootstrappers";
import lstore from "@/plugins/lstore/lstore";
import _ from "lodash";

export const TYPES = {
  SAVE_FEED_LIST: "SAVE_FEED_LIST",
  SAVE_PINNED_LIST: "SAVE_PINNED_LIST",
  SAVE_ADVERTISE: "SAVE_ADVERTISE",
  POPUP_ADVERTISE: "POPUP_ADVERTISE",
  RESET_ADVERTISE: "RESET_ADVERTISE"
};

const state = {
  list: {
    hot: lstore.getData("FEED_LIST_HOT") || [], // 热门动态列表
    new: lstore.getData("FEED_LIST_NEW") || [], // 最新动态
    follow: lstore.getData("FEED_LIST_FOLLOW") || [], // 关注列表
    pinned: lstore.getData("FEED_LIST_PINNED") || [] // 置顶列表
  },

  /** 资讯卡片广告 */
  advertise: {
    type: 0, //  广告类型 ID
    list: lstore.getData("ADVERTISEMENT_FEEDS") || [], // 广告列表
    index: 0 // 当前插入广告位索引
  }
};

const getters = {
  pinned(state) {
    return state.list.pinned;
  },
  hot(state) {
    const list = state.list.hot;
    const chunks = _.chunk(list, 15); // 分片 用于分批插入卡片广告
    const result = [];
    for (const chunk of chunks) {
      // 从广告栈顶取出一条随机插入列表
      let index = state.advertise.index;
      let rand = ~~(Math.random() * 14) + 1;
      rand > chunk.length && (rand = chunk.length);
      state.advertise.list[index] &&
        chunk.splice(rand, 0, state.advertise.list[state.advertise.index++]);
      result.push(...chunk);
    }
    return result;
  },
  new(state) {
    return state.list.new;
  },
  follow(state) {
    return state.list.follow;
  }
};

const mutations = {
  [TYPES.SAVE_FEED_LIST](state, payload) {
    const { type, data, refresh = false } = payload;
    const list = refresh ? data : [...state.list[type], ...data];
    state.list[type] = list;
    lstore.setData(`FEED_LIST_${type.toUpperCase()}`, list);
  },

  [TYPES.SAVE_PINNED_LIST](state, payload) {
    const { list } = payload;
    state.list.pinned = list;
    lstore.setData("FEED_LIST_PINNED", list);
  },

  [TYPES.SAVE_ADVERTISE](state, payload) {
    lstore.setData("ADVERTISEMENT_FEEDS", payload);
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
  /**
   * 获取最新动态列表
   * @author mutoe <mutoe@foxmail.com>
   * @param {*} payload
   */
  async getNewFeeds({ commit }, payload) {
    const { after, refresh = false } = payload;
    const { data } = await api.getFeeds({ type: "new", after });
    const { feeds = [], pinned = [] } = data;
    commit(TYPES.SAVE_PINNED_LIST, { list: pinned });
    commit(TYPES.SAVE_FEED_LIST, { type: "new", data: feeds, refresh });
    return feeds;
  },
  /**
   * 获取热门动态列表
   * @author mutoe <mutoe@foxmail.com>
   * @param {*} payload
   */
  async getHotFeeds({ commit, state }, payload) {
    const { after, refresh = false } = payload;
    const { data } = await api.getFeeds({ type: "hot", hot: after });
    const { feeds = [], pinned = [] } = data;
    commit(TYPES.SAVE_PINNED_LIST, { list: pinned });
    commit(TYPES.SAVE_FEED_LIST, { type: "hot", data: feeds, refresh });
    if (refresh) {
      state.advertise.index = 0;
    }
    return feeds;
  },
  /**
   * 获取关注动态列表
   * @author mutoe <mutoe@foxmail.com>
   * @param {*} payload
   */
  async getFollowFeeds({ commit }, payload) {
    const { after, refresh = false } = payload;
    const { data } = await api.getFeeds({ type: "follow", after });
    const { feeds = [] } = data;
    commit(TYPES.SAVE_FEED_LIST, { type: "follow", data: feeds, refresh });
    return feeds;
  },

  /**
   * 获取卡片广告列表
   * @author mutoe <mutoe@foxmail.com>
   * @returns
   */
  async getAdvertise({ state, commit, rootGetters }) {
    if (!state.advertise.type) {
      const adType = rootGetters.getAdTypeBySpace("feed:list:analog");
      state.advertise.type = adType.id;
    }
    const { data } = await bootApi.getAdsById(state.advertise.type);
    commit(TYPES.SAVE_ADVERTISE, data);
    return data;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
