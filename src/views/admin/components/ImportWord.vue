<template>
  <div class="import-word">
    <el-upload ref="upload" class="upload-demo" action="" drag :file-list="fileList" accept=".xml" :auto-upload="false" :show-file-list="false" :on-change="handleChange">
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div slot="tip" class="el-upload__tip">只能上传 xml 文件</div>
    </el-upload>

    <ul class="preview">
      <li v-for="item in fileList" :key="item.uid">
        <span class="preview-name">{{ item.name }}</span>
        <el-input v-model="item.wordLanguage" class="preview-input" size="mini" placeholder="请输入词条语言" />
      </li>
    </ul>

    <div class="upload"><el-button size="small" type="success" :disabled="fileList.length === 0" @click="handleUpload">上传到服务器</el-button></div>
  </div>
</template>

<script>
export default {
  name: 'ImportWord',

  components: {},

  mixins: [],

  props: {
    transData: {
      type: Object,
      default() {
        return null;
      }
    },
    closeFn: {
      type: Function,
      default() {
        return null;
      }
    }
  },

  data() {
    return {
      fileList: []
      // subData: null
    };
  },

  computed: {},

  watch: {
    // transData(val) {
    //   console.log('父影响子', val);
    //   this.subData = val;
    // },
    // subData(val) {
    //   console.log('子影响父', val);
    //   this.$emit('input', val);
    // }
  },

  created() {},

  mounted() {},

  destroyed() {},

  methods: {
    // 更新文件列表（触发）
    handleChange(file, fileList) {
      if (this.transData) {
        const { id } = this.transData;
        const { name } = file;

        file.id = id;
        file.fileName = name;
        this.fileList = fileList.slice(0);
      }
    },

    // 上传文件（触发）
    handleUpload() {
      if (this.$parent.$parent.importSucceed) {
        const { index } = this.transData;
        var files = [];

        this.fileList.map(item => {
          const { fileName, wordLanguage } = item;

          files.push({
            fileName: fileName,
            fileLink: `词条文件名下载链接${Math.random()}`,
            wordLanguage: wordLanguage
          });
        });

        this.$parent.$parent.importSucceed({ index, files });
      }

      if (this.closeFn) this.closeFn();
    }
  }
};
</script>

<style lang="scss" scoped>
.import-word {
  .preview li {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .preview-name {
      max-width: 50%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preview-input {
      width: 30%;
    }
  }

  .upload {
    text-align: center;
  }
}
</style>
