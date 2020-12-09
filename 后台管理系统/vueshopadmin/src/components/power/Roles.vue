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
        <!-- 添加角色按钮区 -->
        <el-row>
            <el-col>
                <el-button type="primary">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区 -->
        <el-table :data="roleList" border stipe>
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row class="bdbottom vcenter" :class="index1===0?'bdtop':''" v-for="(item1,index1) in scope.row.children" :key="item1.id"> 
                        <!-- 一级权限 -->
                        <el-col :span="5">
                            <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 二级权限和三级权限 -->
                        <el-col :span="19">
                            <el-row class="vcenter" :class="index2==0?'':'bdtop'" v-for="(item2,index2) in item1.children" :key="item2.id">
                               <!-- 二级权限 -->
                                <el-col :span="6">
                                    <el-tag closable @close="removeRightById(scope.row,item2.id)" type="success">{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <!-- 三级权限 -->
                                <el-col :span="18">
                                    <el-tag closable @close="removeRightById(scope.row,item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-edit">删除</el-button>
                    <el-button size="mini" type="warning" icon="el-icon-edit" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed">
        <el-tree :data="righsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      roleList: [], //所有角色列表数据
      setRightDialogVisible: false, //分配权限的对话框
      righsList: [], //所有权限的数据
      treeProps: {
        //树形控件的属性绑定对象
        label: "authName", //用哪个属性来绑定显示的
        children: "children" //父子之间通过谁来嵌套的
      },
      defkeys: [],//默认选中的节点的id数组
      roleId:"",//当前即将分配权限的角色id
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    async getRolesList() {//获取所有角色的列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.roleList = res.data;
    },
    async removeRightById(role, rightId) {
      //根据id删除对应的权限
      const confirmRightById = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmRightById !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      console.log("res", res);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      role.children = res.data;
    },
    async showSetRightDialog(role) {//展示分配权限的对话框
      this.roleId = role.id
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.righsList = res.data;
      this.getLeafKeys(role, this.defkeys); //递归获取三级节点的id
      this.setRightDialogVisible = true;
    },
    getLeafKeys(node, arr) {
      if (!node.children) {
        //如果当前的node节点不包含children属性，则是三级节点
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr);
      });
    },
    setRightDialogClosed() {
      //监听分配权限对话框关闭的事件
      this.defkeys = [];
    },
    async allotRights(){
        const kets = [
            ...this.$refs.treeRef.getCheckedKeys(),//返回目前被选中的节点的id所组成的数组
            ...this.$refs.treeRef.getHalfCheckedKeys()//返回目前被选中的半节点的id所组成的数组
        ]
        const idStr = kets.join(',')
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
        if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
    }
  }
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
