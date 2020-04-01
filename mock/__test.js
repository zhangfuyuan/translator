import Mock from 'mockjs'

const keys = [];

for (let i = 0; i < 3000; i++) keys.push(Mock.mock('@id'));

const wordObj = keys.reduce((total, key) => {
  total[key] = Mock.mock('@guid');
  return total;
}, {})

const wordObj2 = keys.reduce((total, key) => {
  total[key] = Mock.mock('@guid');
  return total;
}, {})

const wordObj3 = keys.reduce((total, key) => {
  total[key] = Mock.mock('@guid');
  return total;
}, {})

const transcriptObj = Object.keys(wordObj).reduce((total, key) => {
  total[key] = '';
  return total;
}, {})

const limitObj = Object.keys(wordObj).reduce((total, key) => {
  total[key] = Mock.mock('@natural(-1, 8)');
  return total;
}, {})

export default [{
  url: '/my-vue-element/__test/wordDetail',
  type: 'post',
  response: config => {
    const {
      edit,
      translationLanguage
    } = config.body

    return {
      errcode: 0,
      data: {
        edit,
        translationLanguage,
        word: {
          '词条语言1': wordObj,
          '词条语言2': wordObj2,
          '词条语言3': wordObj3
        },
        transcript: transcriptObj,
        limit: limitObj
      }
    }
  }
}]
