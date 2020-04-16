import request from '@/utils/request'

/**
六、在线编辑——展示词条
提交：
id                   必要    字符串  唯一编码
edit                 非必要  字符串  是否管理员编辑，1代表是，则显示设置长度限制一列
translationLanguage  必要    字符串  翻译语言
contrast             必要    字符串  对照语言
 * */
export function getWordDetail(option) {
  return request({
    url: '/entry/wordDetail',
    method: 'get',
    params: option
  })
}

/**
七、在线编辑——保存编辑
提交：
id                  必要    字符串      唯一编码
edit                非必要  字符串      是否管理员编辑，1代表是，则显示设置长度限制一列
transcript          必要    json字符串  已翻译的词条对象
translationLanguage 必要    字符串      翻译的语言
limit               非必要  json字符串  长度限制的词条对象，edit为1才保存
isComplete 传1代表该次翻译完成，不传或不等于代表未完成
 * */
export function ajaxSaveWordDetail(option) {
  return request({
    url: '/entry/saveWordDetail',
    method: 'post',
    data: option
  })
}

/**
八、在线编辑——导出XML
提交：
id       必要  字符串  唯一编码
fileType 必要  字符串  '2'
translationLanguage
 * */
export function ajaxExportXML(option) {
  return request({
    url: '/dictionary/exportXML',
    method: 'get',
    params: option
  })
}

/**
九、在线编辑——导出Excel
提交：
id  必要  字符串  唯一编码
fileType 必要  字符串  '4'
 * */
export function ajaxExportExcel(option) {
  return request({
    url: '/entry/exportExcel',
    method: 'get',
    params: option
  })
}

/**
十、在线编辑——导入Excel
提交：
file          必要    文件流  上传xml文件流
chunks        必要    文件流  上传xml文件流分片
recordId      必要    字符串  唯一编码，分片附带
name          必要    字符串  文件名，分片附带
size          必要    数字    文件大小，分片附带
md5           必要    字符串  校验码，分片附带
translationLanguage
fileType      必要    字符串  '3'
 * */
export function ajaxImportExcel(option) {
  return request({
    url: '/entry/importExcel',
    method: 'post',
    data: option
  })
}
