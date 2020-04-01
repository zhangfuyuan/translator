<template>
  <div class="create-link">
    <el-input ref="linkInput" v-model="input" class="link-input" readonly />
    <el-button type="primary" @click="handleCopy">拷贝</el-button>
  </div>
</template>

<script>
export default {
  name: 'CreateLink',

  components: {},

  mixins: [],

  props: {
    transData: {
      type: Object,
      default() {
        return null;
      }
    }
  },

  data() {
    return {
      input: ''
    };
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {
    this.input = encodeURI(`${window.location.href}?id=${this.transData.id}&curTranslationLanguage=${this.transData.curTranslationLanguage || ''}`);
  },

  destroyed() {},

  methods: {
    // 复制（触发）
    handleCopy() {
      const _input = document.createElement('input'); // 直接构建input
      _input.value = this.$refs['linkInput'].value; // 设置内容
      document.body.appendChild(_input); // 添加临时实例
      _input.select(); // 选择实例内容
      document.execCommand('Copy'); // 执行复制
      document.body.removeChild(_input); // 删除临时实例
      this.$message({
        showClose: true,
        message: '拷贝成功',
        type: 'success'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.create-link {
  width: 100%;
  display: flex;
  align-items: center;

  .link-input {
    margin-right: 20px;
    width: 50%;
  }
}
</style>
