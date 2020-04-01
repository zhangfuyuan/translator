<template>
  <div class="admin">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加</el-button>
      <el-input v-model="searchInput" class="search-input" placeholder="请输入版本名" prefix-icon="el-icon-search" @change="handleSearch" />
    </div>

    <!-- 词条列表 -->
    <div class="list">
      <el-table v-loading="tableLoading" :data="tableData" fit stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="versionName" label="版本名" />
        <el-table-column label="词条文件">
          <template slot-scope="scope">
            <template v-if="scope.row.files && scope.row.files.length > 0">
              <div v-for="item in scope.row.files" :key="item.fileLink">
                <el-link type="primary" icon="el-icon-download" :href="item.fileLink" target="_blank">{{ item.fileName }}</el-link>
                <span style="margin-left: 5px">({{ item.wordLanguage }})</span>
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="翻译语言">
          <template slot-scope="scope">
            <template v-if="scope.row.translationLanguage && scope.row.translationLanguage.split(',')">
              <el-select v-model="scope.row.curTranslationLanguage" placeholder="请选择语言" size="mini">
                <el-option v-for="item in scope.row.translationLanguage.split(',')" :key="item" :label="item" :value="item" />
              </el-select>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="updatedTime" label="更新时间" width="160" />
        <el-table-column prop="remark" label="备注" width="100" />
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="handleImport(scope.$index, scope.row)">导入词条</el-button>
            <el-dropdown>
              <el-button size="mini" plain class="more-dropdown">
                更多
                <i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleEdit(scope.$index, scope.row)">编辑</el-dropdown-item>
                <el-dropdown-item :disabled="!scope.row.files.length" @click.native="handleSet(scope.$index, scope.row)">设置词条</el-dropdown-item>
                <el-dropdown-item :disabled="!scope.row.files.length" @click.native="handleLink(scope.$index, scope.row)">生成链接</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页器 -->
    <div class="pagination">
      <el-pagination
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="10"
        :total="400"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :visible.sync="dialogVisible"
      :before-close="handleBeforeClose"
      width="50%"
      @close="handleClose"
    >
      <component :is="dialogComponent" v-model="fatherData" :trans-data="fatherData" :close-fn="closeDialog" />
    </el-dialog>
  </div>
</template>

<script>
import { tableData } from './data.js';
import { CreateLink, CreateRecord, ImportWord, UpdatedRecord } from './components';
import { parseTime } from '@/utils/index.js';

export default {
  name: 'Admin',

  components: { CreateLink, CreateRecord, ImportWord, UpdatedRecord },

  mixins: [],

  props: {},

  data() {
    return {
      searchInput: '', // 搜索关键字
      currentPage: 1, // 当前页码
      tableData, // 表格数据
      tableLoading: false, // 表格是否正在加载数据
      dialogVisible: false, // 弹窗是否显示
      dialogComponent: '', // 弹窗子组件
      dialogTitle: '', // 弹窗标题
      fatherData: null // 用于父子组件双向传递数据
    };
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {},

  destroyed() {},

  methods: {
    // 添加记录（触发）
    handleAdd() {
      this.dialogTitle = '添加';
      this.dialogComponent = 'CreateRecord';
      this.dialogVisible = true;
    },

    // 添加记录成功
    addSucceed(data) {
      if (data) this.tableData.unshift(data);
    },

    // 搜索（触发）
    handleSearch() {
      console.log(`搜索关键字 ${this.searchInput}`);
    },

    // 导入词条（触发）
    handleImport(index, row) {
      console.log(index, row);
      this.dialogTitle = '导入词条';
      this.dialogComponent = 'ImportWord';
      this.fatherData = { index, ...row };
      this.dialogVisible = true;
    },

    // 导入词条成功
    importSucceed(data) {
      if (data) {
        const { index, files } = data;

        if (files && files.length > 0) {
          if (!this.tableData[index].files) this.tableData[index].files = [];

          this.tableData[index].files = this.tableData[index].files.concat(files);
        }
      }
    },

    // 编辑记录（触发）
    handleEdit(index, row) {
      console.log(index, row);
      const { versionName, translationLanguage, remark } = row;

      this.dialogTitle = '编辑';
      this.dialogComponent = 'UpdatedRecord';
      this.fatherData = { index, versionName, translationLanguage, remark };
      this.dialogVisible = true;
    },

    // 添加记录成功
    editSucceed(data) {
      if (data) {
        const { index, versionName, translationLanguage, remark } = data;

        this.tableData[index].versionName = versionName;
        this.tableData[index].translationLanguage = translationLanguage;
        this.tableData[index].updatedTime = parseTime(Date.now());
        this.tableData[index].remark = remark;
      }
    },

    // 设置词条（触发）
    handleSet(index, row) {
      console.log(index, row);
      const { id, curTranslationLanguage } = row;
      const { href } = this.$router.resolve({
        path: '/online',
        query: {
          id: encodeURIComponent(id),
          edit: encodeURIComponent('1'),
          translationLanguage: encodeURIComponent(curTranslationLanguage)
        }
      });
      window.open(href, '_blank');
    },

    // 生成链接（触发）
    handleLink(index, row) {
      console.log(index, row);
      const { id, curTranslationLanguage } = row;

      this.dialogTitle = '生成链接';
      this.dialogComponent = 'CreateLink';
      this.fatherData = { id, curTranslationLanguage };
      this.dialogVisible = true;
    },

    // 改变表格每页显示数量（触发）
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },

    // 改变表格当前页码（触发）
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },

    // 关闭弹窗前（触发）二次确认
    handleBeforeClose(done) {
      if (this.dialogComponent === 'CreateLink') {
        done();
      } else {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      }
    },

    // 手动关闭弹窗
    closeDialog() {
      this.$nextTick(_ => {
        this.dialogVisible = false;
      });
    },

    // 关闭弹窗后（触发）
    handleClose() {
      console.log(`关闭了`);
      this.dialogTitle = '';
      this.dialogComponent = '';
      this.fatherData = null;
    }
  }
};
</script>

<style src="./global.scss" lang="scss"></style>
<style src="./index.scss" lang="scss" scoped></style>
