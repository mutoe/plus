<template>
  <transition name="fade">
    <div v-if="showPage" class="m-box-model m-pos-f p-choose-category m-main">

      <common-header :back="cancel"> {{ title || "圈子分类" }} </common-header>

      <main>
        <ul class="m-cates">
          <li
            v-for="cate in categories"
            v-if="cate.id"
            :key="cate.id"
            class="m-cate"
            @click="selected(cate)"><span>{{ cate.name }}</span></li>
        </ul>
      </main>

    </div>
  </transition>
</template>
<script>
export default {
  name: "ChooseGroupCate",
  data() {
    return {
      showPage: false,
      title: ""
    };
  },
  computed: {
    categories() {
      return this.$store.state.group.categories;
    }
  },
  mounted() {
    this.$store.dispatch("group/getGroupTypes");
  },
  methods: {
    show() {
      this.showPage = true;
      this.scrollable = false;
    },
    selected(cate) {
      this.$emit("change", cate);
      this.cancel();
    },
    cancel() {
      this.showPage = false;
      this.scrollable = true;
    }
  }
};
</script>

<style lang="less" scoped>
.p-choose-category {
  .m-cates {
    padding: 30px;
  }
}
.m-cates {
  margin-top: -30px;
  margin-left: -30px;
}

.m-cate {
  display: inline-block;
  padding: 0 10px;
  margin-top: 30px;
  margin-left: 30px;
  width: calc((1 / 4 * 100%) ~" - 30px");
  height: 60px;
  line-height: 60px;
  font-size: 28px;
  background-color: #f4f5f5;
  border-radius: 8px;
  span {
    overflow: hidden;
    width: 100%;
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
  }
}
</style>
