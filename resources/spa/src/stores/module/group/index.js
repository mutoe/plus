import actions from "./actions";
import lstore from "@/plugins/lstore/lstore";

export const TYPES = {
  SAVE_GROUP: "SAVE_GROUP",
  SAVE_GROUP_CATES: "SAVE_GROUP_CATES"
};

const state = {
  categories: lstore.getData("GROUP_CATES") || [], // 圈子分类
  current: {}, // 当前查看的圈子
  protocol: ""
};

const getters = {};

const mutations = {
  [TYPES.SAVE_GROUP](state, group) {
    state.current = group;
  },

  // 保存圈子分类列表
  [TYPES.SAVE_GROUP_CATES](state, cates) {
    state.categories = cates;
    lstore.setData("GROUP_CATES", cates);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
