<template>
  <div class="login_container">
    <div class="login_box">
         <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="avatar" />
      </div>
      <el-form label-width="0px" ref="formLoginRef" :rules="formRules" :model="formLogin" class="login_form">
        <el-form-item prop="username">
            <el-input v-model="formLogin.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
         <el-form-item prop="password">
            <el-input v-model="formLogin.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
         <el-form-item class="btns">
           <el-button type="primary" @click="login">登陆</el-button>
           <el-button type="info" @click="resetFormLogin">重置</el-button>
        </el-form-item>
      </el-form>
       <!-- <el-button @click="tips">成功</el-button> -->
    </div>
  </div>
</template>

<script>
import { Message } from "element-ui";
export default {
  name: "Login",
  data() {
    return {
      // 表单数据
      formLogin: {
        username: "admin",
        password: "123456"
      },
      //   验证规则
      formRules: {
        username: [
          { required: true, message: "请输入登录名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          { min: 5, max: 15, message: "长度在 5 到 15 个字符", trigger: "blur" }
        ]
      },
    //   弹框提示
      tips(title) {
        Message({
          showClose: true,
          message: title,
          type: "error"
        });
        // 或者
        // this.$message.success("提示词")
      }
    };
  },
  methods: {
    resetFormLogin() {
      this.$refs.formLoginRef.resetFields();
    },
    login() {
      this.$refs.formLoginRef.validate(async (isRight, isRightItem) => {
        //第一个参数表示表单是否合法，合法为true,不合法为false;第二个参数是不合法的字段
        if (!isRight) return; //验证不通过直接return,否则发起请求
        const { data: res } = await this.$http.post("login", this.formLogin);
        if (res.meta.status !== 200) return this.tips(res.meta.msg)
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      });
    }
  }
};
</script>

<style scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 360px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
/* 头像区 */
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}

.avatar_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.login_form {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
