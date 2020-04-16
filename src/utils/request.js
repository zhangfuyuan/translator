import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import Qs from 'qs'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
  // `transformRequest`选项允许我们在请求发送到服务器之前对请求的数据做出一些改动，其作用是让参数（data）序列化
  // 该选项只适用于以下请求方式：`put/post/patch`
  // 数组里面的最后一个函数必须返回一个字符串、-一个`ArrayBuffer`或者`Stream`
  // qs.stringify()将对象 序列化成URL的形式，以&进行拼接（需要qs在此转化为formdata，和api开发人员规定）
  transformRequest: [
    function(data) {
      return Qs.stringify(data);
    },
  ],
  // `paramsSerializer`是一个可选的函数，其作用是让参数（params）序列化
  // 该选项只适用于以下请求方式：`get / delete `
  paramsSerializer: function(params) {
    return Qs.stringify(params);
  },
  // 是否跨域，当然你也可以使用代理proxy 、nginx、
  // 但是一般公司都不会每次都设置代理，而是使用固定的开发模式，例如直接做一个跨域的设置，一劳永逸
  // 这里设置该属性还需要api开发者支持，设置后台的php程序里的header
  withCredentials: true,
  headers: {
    // 请求头，因为我们要使用formdata形式，所以设置如下
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    // 如果采用json传递给后台数据，格式如下（默认）
    // 'Content-Type': 'application/json;charset=UTF-8',
    // 如果上传图片、视频等多媒体文件给后台数据，格式如下
    // 'Content-Type': 'multipart/form-data',
  }
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    // if the custom code is not 20000, it is judged as an error.
    // if (res.code !== 20000) {
    //   Message({
    //     message: res.message || 'Error',
    //     type: 'error',
    //     duration: 5 * 1000
    //   })

    //   // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    //   if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //     // to re-login
    //     MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
    //       confirmButtonText: 'Re-Login',
    //       cancelButtonText: 'Cancel',
    //       type: 'warning'
    //     }).then(() => {
    //       store.dispatch('user/resetToken').then(() => {
    //         location.reload()
    //       })
    //     })
    //   }
    //   return Promise.reject(new Error(res.message || 'Error'))
    // } else {
    //   return res
    // }
    return res
  },
  error => {
    console.log(error) // for debug
    Message({
      showClose: true,
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
