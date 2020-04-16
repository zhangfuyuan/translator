<template>
  <div class="set-word">
    <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">{{ $t('common.checkAll') }}{{ $t('admin.contrastLanguage') }}</el-checkbox>
    <div style="margin: 15px 0;" />
    <el-checkbox-group v-model="checkedLanguage" class="checkbox-group" @change="handleCheckedLanguageChange">
      <el-checkbox v-for="(language, index) in transData.wordLanguageList" :key="index" :label="language" />
    </el-checkbox-group>

    <el-button type="primary" :disabled="!checkedLanguage.length" @click="handleConfirm">{{ $t('common.confirm') }}</el-button>
  </div>
</template>

<script>
import { ajaxCreateLink } from '@/api/admin';

export default {
  name: 'SetWord',

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
          edit: '1',
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

          if (errcode === 0 && data && data.href) window.open(data.href, '_blank');
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
.set-word {
  width: 100%;

  .checkbox-group {
    margin-bottom: 30px;
  }
}
</style>
