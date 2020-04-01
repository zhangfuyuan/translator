<template>
  <div class="online">
    <div class="header">
      <div class="saved-time">
        最近保存时间：
        <span>{{ savedTime }}</span>
      </div>

      <div class="toolbar">
        <el-button size="small" type="success">导出XML</el-button>
        <el-button size="small">导出Excel</el-button>
        <el-button size="small">导入Excel</el-button>
        <el-button ref="saveBtn" size="small" type="primary" :disabled="!isChange" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="main"><hot-table ref="hotTable" class="my-table" :settings="settings" :language="language" license-key="non-commercial-and-evaluation" /></div>
  </div>
</template>

<script>
import { HotTable } from '@handsontable/vue';
import Handsontable from 'handsontable';
import 'handsontable/languages/zh-CN';
import { getWordDetail } from '@/api/__test';
import { parseTime } from '@/utils/index.js';

export default {
  name: 'Online',

  components: { HotTable },

  mixins: [],

  props: {},

  data() {
    return {
      settings: {
        data: [['Loading...']],
        rowHeaders: true,
        colHeaders: true,
        contextMenu: ['undo', 'redo', 'alignment', '---------', 'cut', 'copy'],
        manualColumnResize: true,
        manualRowResize: true,
        width: '100%',
        stretchH: 'all'
      },
      language: 'en-US',
      submitData: {
        id: '',
        edit: '',
        translationLanguage: '',
        transcript: {},
        limit: {}
      },
      wordKeyMap: {},
      transcriptColIndex: -1,
      limitColIndex: -1,
      savedTime: '--',
      hotInstance: null,
      isKeydownCtrlS: false,
      errorWordList: [],
      isChange: false
    };
  },

  computed: {},

  watch: {},

  created() {},

  mounted() {
    document.addEventListener('keydown', this.handleCtrlS, false);
    const query = this.$route.query;

    if (this.$i18n.locale === 'zh') this.language = 'zh-CN';

    if (query) {
      const { id, edit, translationLanguage } = query;

      this.submitData.id = decodeURIComponent(id);
      this.submitData.edit = decodeURIComponent(edit);
      this.submitData.translationLanguage = decodeURIComponent(translationLanguage);
    }

    this.initHotTable();
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleCtrlS);
    Handsontable.hooks.remove('beforeChange', this.handleBeforeKeyDown, this.hotInstance);
    Handsontable.hooks.remove('afterChange', this.handleAfterChange, this.hotInstance);
    this.hotInstance = null;
  },

  methods: {
    // 初始化Excel表格
    initHotTable() {
      console.time('初始化表格用时');
      const { id, edit, translationLanguage } = this.submitData;

      getWordDetail({ id, edit, translationLanguage }).then(res => {
        if (res.errcode === 0 && res.data) {
          const { edit, translationLanguage, word, transcript, limit } = res.data;
          const wordLangKeys = (word && Object.keys(word)) || null;
          const wordLangLen = (wordLangKeys && wordLangKeys.length) || 0;

          if (wordLangLen) {
            let data = null;
            let colHeaders = [...wordLangKeys, translationLanguage || ''];
            const columns = [{ readOnly: true }]; // 词条首列只读
            const firstWordLangKeys = wordLangKeys[0];
            const firstWord = word[firstWordLangKeys];
            const otherWordLangKeys = wordLangKeys.slice(1);
            const hasOtherWordLang = (otherWordLangKeys && otherWordLangKeys.length > 0) || false;
            const isEdit = edit === '1' || edit === 1;

            data = Object.keys(firstWord).map((key, index) => {
              let wordVal = firstWord[key];
              const row = [wordVal]; // 词条首列
              let strLimit = limit[key];
              const isLimit = strLimit > -1;
              strLimit = isLimit ? strLimit : wordVal.length;

              if (hasOtherWordLang) {
                otherWordLangKeys.map(lang => {
                  wordVal = word[lang][key];
                  row.push(wordVal); // 多语言词条列
                  if (index === 0) columns.push({ readOnly: true }); // 多语言词条列只读

                  if (!isLimit && wordVal.length > strLimit) strLimit = wordVal.length;
                });
              }

              row.push(transcript[key]); // 翻译列
              if (index === 0) columns.push({}); // 翻译列可写

              if (isEdit) {
                row.push(limit[key]); // 设置长度限制列
                if (index === 0) columns.push({}); // 设置长度限制列可写
              }

              row.push(strLimit); // 显示长度限制列
              if (index === 0) columns.push({ readOnly: true }); // 显示长度限制列只读

              this.wordKeyMap[index] = key;
              return row;
            });

            if (isEdit) colHeaders = colHeaders.concat(['设置长度限制', '长度限制']);
            else colHeaders.push('长度限制');

            this.settings.columns = columns;
            this.settings.colHeaders = colHeaders;
            this.hotInstance = this.$refs['hotTable'].hotInstance;
            Handsontable.hooks.add('beforeKeyDown', this.handleBeforeKeyDown, this.hotInstance);
            Handsontable.hooks.add('afterChange', this.handleAfterChange, this.hotInstance);
            this.submitData.transcript = transcript;
            this.submitData.limit = limit;
            this.transcriptColIndex = wordLangLen;

            if (isEdit) this.limitColIndex = wordLangLen + 1;

            this.$nextTick(_ => {
              this.settings.data = data;
              console.timeEnd('初始化表格用时');
            });
          }
        }
      });
    },

    // 修改Excel单元格前（触发）
    handleBeforeKeyDown(e) {
      const isCtrlKey = navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey;

      if (!isCtrlKey) this.isChange = true;
    },

    // 修改Excel单元格后（触发）
    handleAfterChange(changes) {
      console.time('修改单元格处理用时');
      if (changes) {
        let needRender = false;
        let isChange = false;
        const invalidClassReg = new RegExp('(\\s|^)(warn-word|error-word)(\\s|$)');
        const errorClassReg = new RegExp('(\\s|^)error-word(\\s|$)');
        const { transcript, limit } = this.submitData;

        changes.forEach(([row, col, oldValue, newValue]) => {
          if (oldValue !== newValue) {
            isChange = true;
            const key = this.wordKeyMap[row];
            const data = this.settings.data[row];
            const transcriptColIndex = this.transcriptColIndex;
            const className = this.hotInstance.getCellMeta(row, this.transcriptColIndex).className || '';
            const rowCol = `${row},${transcriptColIndex}`;
            let newValueLen = '';

            if (col === transcriptColIndex) {
              // 修改了翻译列的单元格
              transcript[key] = newValue;
              newValueLen = newValue.length;
            }

            if (col === this.limitColIndex) {
              // 修改了设置长度限制列的单元格
              const newValueNum = parseInt(newValue);
              const newValueNum2 = isNaN(newValueNum) ? -1 : newValueNum;

              if (newValueNum + '' !== newValue + '') data[col] = newValueNum2;

              limit[key] = newValueNum2;
              data[data.length - 1] = newValueNum2;
              newValueLen = data[transcriptColIndex].length;
            }

            const validType = newValueLen > parseInt(data[data.length - 1]) ? (limit[key] > -1 ? 'error' : 'warn') : 'valid';
            const classType = className && className.match(invalidClassReg) ? (className.match(errorClassReg) ? 'error' : 'warn') : 'valid';
            const errorWordListIndex = this.errorWordList.indexOf(rowCol);

            console.log(className, validType, classType, errorWordListIndex);

            if (validType === 'error') {
              if (classType === 'warn') {
                this.hotInstance.setCellMeta(row, transcriptColIndex, 'className', className.replace(invalidClassReg, 'error-word'));
                needRender = true;
              } else {
                this.hotInstance.setCellMeta(row, transcriptColIndex, 'className', className + ' error-word');
                needRender = true;
              }

              if (errorWordListIndex === -1) this.errorWordList.push(rowCol);
            } else if (validType === 'warn') {
              if (classType === 'error') {
                this.hotInstance.setCellMeta(row, transcriptColIndex, 'className', className.replace(invalidClassReg, 'warn-word'));
                needRender = true;
              } else if (classType !== 'warn') {
                this.hotInstance.setCellMeta(row, transcriptColIndex, 'className', className + ' warn-word');
                needRender = true;
              }

              if (errorWordListIndex > -1) this.errorWordList.splice(errorWordListIndex, 1);
            } else {
              if (classType === 'error' || classType === 'warn') {
                this.hotInstance.setCellMeta(row, transcriptColIndex, 'className', className.replace(invalidClassReg, ' '));
                needRender = true;
              }

              if (errorWordListIndex > -1) this.errorWordList.splice(errorWordListIndex, 1);
            }
          }
        });

        if (needRender) this.hotInstance.render();

        if (isChange) {
          this.saveSumbit(this.isKeydownCtrlS);
          this.isKeydownCtrlS = false;
        }
      }
      this.isChange = false;
      console.timeEnd('修改单元格处理用时');
    },

    // 保存数据（触发）
    handleSave() {
      const { transcript, limit } = this.submitData;

      Object.keys(this.wordKeyMap).map(row => {
        const key = this.wordKeyMap[row];
        const data = this.settings.data[row];

        transcript[key] = data[this.transcriptColIndex];
        limit[key] = parseInt(data[this.limitColIndex]);
      });

      this.saveSumbit(true);
    },

    // Ctrl + S 阻止浏览器默认行为（触发）
    handleCtrlS(e) {
      // 可以判断是不是mac，如果是mac,ctrl变为花键
      if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
        // event.preventDefault() 方法阻止元素发生默认的行为。
        e.preventDefault();

        // 目的是手动失焦，触发 hooks
        if (this.hotInstance) {
          const selected = this.hotInstance.getSelectedLast();

          if (selected) {
            const [, , endRow, endCol] = selected;

            this.isKeydownCtrlS = true;
            this.hotInstance.selectCell(endRow + 1, endCol, endRow + 1, endCol);
          }
        }
      }
    },

    // 保存的数据校验及提交
    saveSumbit(isShowMsg) {
      if (this.errorWordList.length === 0) {
        const { id, edit, transcript, limit } = this.submitData;
        console.log('Sumbit : ', { id, edit, transcript: JSON.stringify(transcript), limit: JSON.stringify(limit) });

        setTimeout(_ => {
          this.savedTime = parseTime(Date.now(), '{h}:{i}:{s}');

          if (isShowMsg) {
            this.$message({
              showClose: true,
              message: '保存成功',
              type: 'success'
            });
          }
        }, 500);
      } else if (isShowMsg) {
        this.$message({
          showClose: true,
          message: '保存失败，部分翻译词条长度超出限制',
          type: 'error'
        });
      }
    }
  }
};
</script>

<style src="./handsontable.full.min.css"></style>
<style src="./global.scss" lang="scss"></style>
<style src="./index.scss" lang="scss" scoped></style>
