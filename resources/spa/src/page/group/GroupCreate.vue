<template>
  <div class="p-group-create">
    <common-header>创建圈子
      <span
        slot="left"
        class="m-send-btn"
        @click="goBack">取消</span>
      <template slot="right">
        <circle-loading v-if="loading" />
        <a
          v-else
          :class="{ disabled }"
          class="m-send-btn"
          @click.prevent="handleOk">创建</a>
      </template>
    </common-header>

    <form>

      <form-avatar-item
        v-model="avatar"
        label="上传圈子头像"
        shape="square"
        type="blob" />

      <form-input-item
        v-model="form.name"
        label="圈名"
        maxlength="20"
        placeholder="输入圈名, 20字以内"/>

      <form-select-item
        v-model="category.name"
        label="分类"
        placeholder="选择圈子类别"
        @click="switchCate"/>

      <!-- 标签选择 -->
      <form-tags-item v-model="tags" />

      <!-- 位置选择 -->
      <form-location-item v-model="location"/>

      <form-input-item
        v-model="form.summary"
        type="textarea"
        label="简介"
        maxlength="255"
        warnlength="200"
        placeholder="编辑简介"/>

      <hr>

      <form-switch-item v-model="allowFeed" label="帖子同步至动态"/>

      <form-switch-item v-model="privateMode" label="设置为封闭圈子" />

      <template v-if="privateMode">
        <section class="c-form-item bb">
          <label class="check-label" @click="needPaid = true">
            <input :value="needPaid" type="checkbox" >
            <span class="checkmark"/>
            <span>收费入圈</span>
          </label>
          <label class="label-amount">
            <input
              v-model="form.money"
              type="text"
              placeholder="设置收费入圈金额"
              maxlength="8">
            <span>{{ currencyUnit }}</span>
          </label>
        </section>

        <section class="c-form-item bb">
          <label class="check-label" @click="needPaid = false">
            <input :value="!needPaid" type="checkbox" >
            <span class="checkmark"/>
            <span>免费入圈</span>
          </label>
        </section>
      </template>

      <p class="footage">注：用户需经圈管理员同意方可加入封闭圈子</p>

      <form-input-item
        v-model="form.notice"
        type="textarea"
        label="公告"
        placeholder="选填"
        maxlength="2000"
        warnlength="200" />

      <p class="footage">点击创建即代表同意<a href="javascript:;" @click="showProtocol">《ThinkSNS+圈子创建协议》</a></p>

    </form>

    <!-- 选择圈子分类遮罩层 -->
    <choose-group-cate ref="chooseGroupCate" @change="onGroupCateChange"/>

    <!-- 圈子协议遮罩层 -->
    <group-protocol ref="protocol"/>

  </div>
</template>

<script>
import ChooseGroupCate from "./components/chooseGroupCate.vue";
import GroupProtocol from "./components/GroupProtocol.vue";
import { encodeGeoHash } from "@/util/geohash";

export default {
  name: "GroupCreate",
  components: {
    ChooseGroupCate,
    GroupProtocol
  },
  data() {
    return {
      loading: false,
      needPaid: false,
      category: {}, // 分类
      tags: [], // 标签
      location: {
        label: "设置圈子的地理位置"
      },
      avatar: null, // 头像, Blob 或 File 对象

      privateMode: false, // 是否私有圈子

      form: {
        name: "", // 圈名
        summary: "", // 简介
        allow_feed: 0,
        mode: "public",
        money: "",
        notice: "" // 公告
      }
    };
  },
  computed: {
    disabled() {
      // 必填字段
      if (
        !this.avatar ||
        !this.form.name ||
        !this.tags.length ||
        !this.form.mode
      )
        return true;

      // 如果设置了收费圈子却没有设置金额 或金额超出范围 不允许提交
      if (this.form.mode === "paid" && !this.form.money.match(/^\d{1,8}$/))
        return true;

      return false;
    },
    allowFeed: {
      get() {
        return !!this.form.allow_feed;
      },
      set(val) {
        this.form.allow_feed = val ? 1 : 0;
      }
    }
  },
  watch: {
    privateMode(val) {
      this.form.mode = !val ? "public" : this.needPaid ? "paid" : "private";
    },
    needPaid(val) {
      if (val) this.form.mode = "paid";
      else {
        this.form.mode = "private";
        this.form.money = null;
      }
    },
    "form.money"(val) {
      if (val) this.needPaid = true;
    }
  },
  methods: {
    showProtocol() {
      this.$refs.protocol.show();
    },
    switchCate() {
      this.$refs.chooseGroupCate.show();
    },
    onGroupCateChange(cate) {
      this.category = cate;
    },
    async handleOk() {
      if (this.loading) return;
      this.loading = true;

      // 构造 FormData 对象 (因为头像上传需要)
      const formData = new FormData();

      // 挂载表单数据
      for (const key in this.form) {
        if (!this.form[key]) continue;
        formData.append(key, this.form[key]);
      }

      // 挂载标签
      for (const tag of this.tags) {
        formData.append("tags[][id]", tag.id);
      }

      // 挂载位置信息
      if (this.location.label) {
        const geoHash = encodeGeoHash(this.location.lat, this.location.lng);
        formData.append("location", this.location.label);
        formData.append("latitude", this.location.lat);
        formData.append("longitude", this.location.lng);
        formData.append("geo_hash", geoHash);
      }

      // 挂载头像
      formData.append("avatar", this.avatar);

      // 提交后端
      const payload = { category: this.category.id, formData };
      const result = await this.$store.dispatch("group/createGroup", payload);
      this.loading = false;
      this.$Message.success(result);
      this.goBack();
    }
  }
};
</script>

<style lang="less" scoped>
@import url("~@/components/form/formItem.less");

.p-group-create {
  .c-form-item {
    background-color: #fff;

    > label {
      flex: auto;
    }
  }

  .c-form-switch-item {
    border-bottom: 1px solid @border-color;
  }

  .footage {
    color: #b3b3b3;
    font-size: 20px;
    margin: 10px 14px 30px;
  }

  .check-label {
    display: block;
    position: relative;
    padding-left: 48px;
    margin-bottom: 12px;
    cursor: pointer;
    user-select: none;
    color: #333;

    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;

      &[value="true"] ~ .checkmark::after {
        display: block;
      }
    }

    .checkmark {
      position: absolute;
      top: 8px;
      left: 0;
      height: 30px;
      width: 30px;
      border: 1px solid @border-color;
      vertical-align: middle;

      &::after {
        content: "";
        position: absolute;
        display: none;
        left: 8px;
        top: 0;
        width: 12px;
        height: 24px;
        border: solid #70d0ab;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
      }
    }
  }

  .label-amount {
    display: flex;
    justify-content: space-around;
    text-align: right;
    padding-right: 20px;
    width: 10em;

    input {
      display: inline-block;
      height: 100%;
      width: 100%;
      text-align: right;
      margin-right: 20px;
      font-size: 30px;
    }

    > span {
      flex: none;
    }
  }
}

.bb {
  border-bottom: 1px solid @border-color;
}
</style>
