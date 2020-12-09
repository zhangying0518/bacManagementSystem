<template>
  <div>
   <!-- 面包屑导航 -->
   <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item><a href="/">用户列表</a></el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片区域 -->
  <el-card>
    <!-- 搜索 -->
    <el-row :gutter="20">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
      </el-col>
    </el-row>
    <!-- 用户列表区 -->
    <el-table
      :data="userList"
      border
      stripe
      style="width: 100%">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <!-- 在表格里面加入template，并绑定slot-scope="scope"，就存在一个scope.row，scope.row是这一行的所有数据
        表格里面的开关必须在外层加template -->
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="190px">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 5]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      <!-- layout分页上面都展示哪些项，把total删了就不会显示共多少条数据 -->
    </el-pagination>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
         <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
         <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
         <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed">
      <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editFrom.username" disabled></el-input>
        </el-form-item>
         <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFrom.email"></el-input>
        </el-form-item>
         <el-form-item label="手机" prop="mobile">
          <el-input v-model="editFrom.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
    title="分配角色"
    :visible.sync="setRoleDialogVisible"
    width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{uerInfo.username}}</p>
        <p>当前的角色：{{uerInfo.role_name}}</p>
        <p>分配新的角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    var checkEmail = (rule, value, callback) => {
      //验证邮箱的正则表达式
      // rule:验证规则，value：验证的值，callback回调函数
      const regEmail = /^\w+@\w+(\.\w+)+$/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的邮箱"));
    };
    var checkMobile = (rule, value, callback) => {
      //验证手机号的正则表达式
      const regMobile = /^1[34578]\d{9}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("请输入合法的手机号"));
    };
    return {
      queryInfo: {
        //用户列表接口参数
        query: "", //搜索关键字
        pagenum: 1,
        pagesize: 2
      },
      userList: [], //用户列表数据
      total: 0, //总页数
      addDialogVisible: false, //控制添加用户对话框的显示与隐藏
      editDialogVisible: false, //控制修改用户对话框的显示与隐藏
      addForm: {
        //添加用户的表单数据
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      addFormRules: {
        // 表单验证规则对象
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3-10个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "用户名的长度在6-15个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editFromRules: {
        //修改表单验证规则
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入电话", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editFrom: {}, //通过查询id查询到的用户信息
      setRoleDialogVisible: false, //分配角色对话框的显示与隐藏
      uerInfo: {}, //需要被分配角色的用户信息
      rolesList: [], //所有角色的数据列表
      selectedRoleId: "" //已选中的角色id值
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      // 用户列表数据
      const res = await this.$http.get("users", { params: this.queryInfo });
      if (res.data.meta.status !== 200) {
        return this.$message.error(res.data.meta.msg);
      } else {
        this.userList = res.data.data.users;
        this.total = res.data.data.total;
      }
    },
    handleSizeChange(newSize) {
      // 监听pageSize改变的事件
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    handleCurrentChange(newPage) {
      // 监听页码值改变事件
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    async userStateChanged(userInfo) {
      // 监听switch开关状态的改变
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state;
        return this.message.error(res.meta.msg);
      } else {
        this.$message.success(res.meta.msg);
      }
    },
    addDialogClosed() {
      //监听添加用户话框的关闭事件
      this.$refs.addFormRef.resetFields();
    },
    editDialogClosed() {
      //监听修改用户对话框的关闭事件
      this.$refs.editFromRef.resetFields();
    },
    addUser() {
      //点击按钮添加新用户
      this.$refs.addFormRef.validate(async valid => {
        //valid为false不合法，反之合法
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log("res", res);
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg);
        } else {
          this.$message.success(res.meta.msg);
          this.addDialogVisible = false;
          this.getUserList();
        }
      });
    },
    editUserInfo(id) {
      //修改用户信息并提交
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editFrom.id,
          {
            email: this.editFrom.email,
            mobile: this.editFrom.mobile
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.editDialogVisible = false;
        this.getUserList();
        this.$message.success(res.meta.msg);
      });
    },
    async removeUserById(id) {
      //根据id删除对应的用户信息
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err); //当只有一句时可以不写大括号,不写大括号那么就不用写return
      if (confirmResult !== "confirm") {
        //点击了取消
        return this.$message.info("已取消删除");
      }
      // 点击了确定
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getUserList();
    },
    async showEditDialog(id) {
      //展示编辑用户的对话框
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.editFrom = res.data;
      this.editDialogVisible = true;
    },
    async setRole(uerInfo) {
      //展示分配角色的对话框
      this.uerInfo = uerInfo;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("请选择要分配的角色");
      }
      const { data: res } = await this.$http.put(
        `users/${this.uerInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    setRoleDialogClosed(){//监听分配角色对话框的关闭事件
      this.selectedRoleId = ""
      this.uerInfo = {}
    }
  }
};
</script>

<style>
</style>
