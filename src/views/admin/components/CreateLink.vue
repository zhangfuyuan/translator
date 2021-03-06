<template>
  <div class="create-link">
    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">{{ $t('common.checkAll') }}{{ $t('admin.contrastLanguage') }}</el-checkbox>
    <div style="margin: 15px 0;" />
    <el-checkbox-group v-model="checkedLanguage" class="checkbox-group" @change="handleCheckedLanguageChange">
      <el-checkbox v-for="(language, index) in transData.wordLanguageList" :key="index" :label="language" />
    </el-checkbox-group>

    <el-button type="primary" :disabled="!checkedLanguage.length" @click="handleConfirm">{{ $t('common.confirm') }}</el-button>

    <div class="link-box">
      <el-input ref="linkInput" v-model="input" class="link-input" readonly />
      <el-button type="success" :disabled="!input" @click="handleCopy">{{ $t('common.copy') }}</el-button>
    </div>
  </div>
</template>

<script>
import { ajaxCreateLink } from '@/api/admin';

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
      input: '',
      checkAll: false,
      checkedLanguage: [],
      isIndeterminate: true
    };
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  destroyed() {},

  methods: {
    // 复制（触发）
    handleCopy() {
      const _input = document.createElement('input'); // 直接构建input
      _input.value = this.$refs['linkInput'].value; // 设置内容
      document.body.appendChild(_input); // 添加临时实例
      _input.select(); // 选择实例内容
      this.$refs['linkInput'].select(); // 选择实例内容
      document.execCommand('Copy'); // 执行复制
      document.body.removeChild(_input); // 删除临时实例
      this.$message({
        showClose: true,
        message: this.$t('admin.copySuccess'),
        type: 'success'
      });
    },
    handleCheckAllChange(value) {
      this.checkedLanguage = value ? this.transData.wordLanguageList : [];
      this.isIndeterminate = false;
    },
    handleCheckedLanguageChange(value) {
      const checkedCount = value.length;
      const languageCount = this.transData.wordLanguageList.length;

      this.checkAll = checkedCount === languageCount;
      this.isIndeterminate = checkedCount > 0 && checkedCount < languageCount;
    },
    handleConfirm() {
      const { id, translationLanguage } = this.transData;

      if (id && this.checkedLanguage.length > 0 && translationLanguage) {
        const query = {
          id: encodeURIComponent(id),
          contrast: encodeURIComponent(this.checkedLanguage + ''),
          translationLanguage: encodeURIComponent(translationLanguage)
        };
        const { href } = this.$router.resolve({ path: '/online', query });

        ajaxCreateLink({
          id,
          href,
          contrast: query.contrast,
          translationLanguage: query.translationLanguage
        }).then(res => {
          const { errcode, data } = res;

          if (errcode === 0 && data && data.href) this.input = `${window.location.origin}${process.env.VUE_APP_PUBLIC_PATH}${data.href}`;
          else {
            this.$message({
              showClose: true,
              message: this.$t('common.failedOperation'),
              type: 'error'
            });
          }
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.create-link {
  width: 100%;

  .checkbox-group {
    margin-bottom: 30px;
  }

  .link-box {
    margin-top: 50px;
    width: 100%;
    display: flex;
    align-items: center;

    .link-input {
      margin-right: 20px;
      width: 50%;
    }
  }
}
</style>
