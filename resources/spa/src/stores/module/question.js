import * as answerApi from "@/api/question/answer";
import * as questionApi from "@/api/question/questions";
import * as topicApi from "@/api/question/topics";

const actions = {
  async postAnswer(state, payload) {
    const { questionId, content, anonymity = 0 } = payload;
    const { data } = await answerApi.postAnswer(questionId, {
      body: content,
      text_body: content,
      anonymity
    });

    return data;
  },

  async searchQuestion(state, payload) {
    const { keyword = "", type } = payload;
    if (!keyword) return Promise.resolve([]);
    const { data } = await questionApi.queryList({ subject: keyword, type });
    return data || [];
  },

  async searchTopics(state, payload) {
    const { keyword = "" } = payload;
    if (!keyword) return Promise.resolve([]);
    const { data } = await topicApi.query({ name: keyword });
    return data || [];
  }
};

export default {
  namespaced: true,
  actions
};
