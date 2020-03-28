<template>
  <div class="create-record">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="版本名" prop="versionName"><el-input v-model="form.versionName" :placeholder="placeholder.versionName" /></el-form-item>
      <el-form-item label="翻译语言" prop="translationLanguage"><el-input v-model="form.translationLanguage" :placeholder="placeholder.translationLanguage" /></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" :placeholder="placeholder.remark" /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('form')">立即添加</el-button>
        <el-button @click="resetForm('form')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CreateRecord',

  components: {},

  mixins: [],

  props: {
    closeFn: {
      type: Function,
      default() {
        return null;
      }
    }
  },

  data() {
    return {
      form: {
        versionName: '',
        translationLanguage: '',
        remark: ''
      },
      placeholder: {
        versionName: '请输入版本名（必填），推荐格式："应用名_版本号"，建议所有的版本名均唯一',
        translationLanguage: '请输入翻译语言（选填），多个请用","隔开',
        remark: '请输入备注（选填）'
      },
      rules: {
        versionName: [{ required: true, message: '版本名必填', trigger: 'blur' }, { min: 3, max: 48, message: '长度在 3 到 48 个字符', trigger: 'blur' }]
      }
    };
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  destroyed() {},

  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.$parent.$parent.addSucceed) this.$parent.$parent.addSucceed({ id: '新增记录唯一编码', files: [], updatedTime: '2020-02-25 00:00:00', ...this.form });

          if (this.closeFn) this.closeFn();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style lang="scss" scoped>
.create-link {
}
</style>
