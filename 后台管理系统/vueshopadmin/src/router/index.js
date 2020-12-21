import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login'
import Home from '@/components/Home'
import Welcome from '@/components/Welcome'
import Users from '@/components/user/Users'
import Rights from '@/components/power/rights'
import Roles from '@/components/power/Roles'
import Cates from '@/components/goods/Cate'
import Params from '@/components/goods/Params'
import GoodsList from '@/components/goods/List'
import Add from '@/components/goods/Add'
import Order from '@/components/order/Order'

Vue.use(Router)

const router = new Router({//一级路由页面都从app.vue的<router-view/>这个标签出去，二级路由往一级路由页面的<router-view/>出去
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    {
      path: '/home', name: 'Home', component: Home, redirect: "/welcome",
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },//  '/users'表示访问路径为/users时，加载组件Users，而不是访问路径为/home/users加载组件Users，
        // { path: 'users', component: Users }//  'users'表示访问路径为/home/users时，加载组件Users，上下两者刚刚相反
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cates },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order }
      ]
    }
  ]
})
router.beforeEach((to, from, next) => {
  // to:将要访问的路径
  // from:从哪个路径跳转而来
  // next:是一个函数,表示放行next(),next('/login')表示强制跳转
  if (to.path == '/login') {//如果访问的是登录页，直接放行
    return next()
  } else {//如果不是登录页，判断有没有token,没有强制到登录页去，如果有直接放行
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) {
      return next('/login')
    } else {
      next()
    }
  }
})
export default router
