<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
       <el-table :data="rightsList" border stripe>
           <el-table-column type="index"></el-table-column>
           <el-table-column prop="authName" label="权限名称"></el-table-column>
           <el-table-column prop="path" label="路径"></el-table-column>
           <el-table-column prop="level" label="权限等级">
               <template slot-scope="scope">
                   <el-tag v-if="scope.row.level=='0'">一级</el-tag>
                   <el-tag v-else-if="scope.row.level=='1'" type="success">二级</el-tag>
                   <el-tag v-else type="warning">三级</el-tag>
               </template>
           </el-table-column>
       </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data(){
      return{
          rightsList:[],//权限列表数据
      }
  },
  created(){
      this.getRightsList()
  },
  methods:{
      async getRightsList(){
          const {data:res} = await this.$http.get('rights/list')
          if(res.meta.status!==200){
              return this.$message.console.error(res.meta.msg);
          }
          this.rightsList = res.data
          console.log(this.rightsList )
      }
  }
};
</script>

<style scoped>

</style>
