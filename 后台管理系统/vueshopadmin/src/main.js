// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'

import VueQuillEditor from 'vue-quill-editor'//富文本编辑器

import "./assets/css/global.css"
import 'element-ui/lib/theme-chalk/index.css';
import './assets/fonts/iconfont.css';

// 富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"//配置请求的根路径
axios.interceptors.request.use(config => {//添加请求拦截器，就是在发请求之前先去调用use函数做预处理，config就是请求的对象，包括请求方式，地址等
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config //必须return
})
Vue.prototype.$http = axios

Vue.use(Element)

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)

Vue.use(VueQuillEditor)//富文本编辑器

Vue.filter('dateFormat', function (origiVal) {
  //dateFormat过滤器的名字，function（）过滤器的处理函数
  // origiVal需要处理的那个时间的数据
  // padStart()字符串方法：第一个参数表示总长度为多少位，
  // 第二个参数表示不足规定的长度的话，用哪个字符串来填充
  const dt = new Date(origiVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
