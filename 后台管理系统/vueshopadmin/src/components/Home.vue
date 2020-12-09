<template>
<!-- element-ui中每一个组件名称就是一个类名 -->
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
       <el-button type="info" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <!-- 左边 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          router
          :default-active="activePath"
          :collapse-transition="false"
          :collapse="isCollapse">
          <!-- el-submenu一级菜单 -->
          <el-submenu :index="menuList.id+''" v-for="(menuList,index) in menuLists" :key="index">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <i :class="iconsObj[menuList.id]"></i>
              <span>{{menuList.authName}}</span>
            </template>
            <!-- el-menu-item二级菜单 -->
            <el-menu-item @click="saveNavState('/'+item.path)" :index="'/'+item.path" v-for="(item,index) in menuList.children" :key="index">
              <!-- 二级菜单模板区 -->
               <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{item.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右边 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "Home",
  data(){
    return {
      iconsObj:{
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse:false,//是否折叠左侧菜单
      activePath:"",//被激活的链接地址
      menuLists: []
    }
  },
  mounted(){
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    // 退出登录
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
     // 获取请求菜单
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuLists = res.data
    },
    // 切换左边栏折叠与展开
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    // 保存链接的激活状态
    saveNavState(activePath){//default-active,当前激活菜单的路径
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  }
};
</script>

<style scpoped>
.el-container {
  height: 100%;
}
/* 头部 */
.el-header {
  background-color: #373f41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
}
.el-header > div {
  display: flex;
  align-items: center;
}
.el-header > div > img {
  height: 40px;
}
.el-header > div > span {
  margin-left: 15px;
}
/* 左边 */
.el-aside {
  background-color: #333744;
}
.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.el-menu{
  border-right: none;
}
.iconfont{
  margin-right: 10px;
}
/* 右边 */
.el-main {
  background-color: #eaedf1;
}
</style>
