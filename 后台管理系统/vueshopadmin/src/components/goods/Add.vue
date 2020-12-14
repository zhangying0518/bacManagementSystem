<template>
  <div>
    <!-- 面包屑导航 -->
   <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片区域 -->
  <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="添加商品信息！"
        type="info"
        center
        show-icon 
        :closable="false">
      </el-alert>
      <!-- 步骤条区域 -->
      <!-- el-steps的active必须是数字，但是data里面的activeIndex是字符串，
      将一个数字字符串转换为数字只需要用该字符串-0 -->
      <el-steps :space="200" align-center :active="activeIndex-0" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
    </el-steps>
    <!-- tab栏区域 -->
    <!-- el-tab-pane的name属性值会同步到el-tabs的v-model上 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click='tabClicked'>
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
              expand-trigger="hover"
              v-model="addForm.goods_cat"
              :options="cateList"
              :props="cateProps"
              @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
               <el-checkbox-group v-model="item.attr_vals">
                 <el-checkbox border :label="item1" v-for="(item1,index1) in item.attr_vals" :key="index1"></el-checkbox>
               </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                  <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success='handleSuccess'>
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
          <el-tab-pane label="完成" name="5">完成</el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
  <!-- 图片预览 -->
  <el-dialog
  title="图片预览"
  :visible.sync="previewVisible"
  width="50%">
  <img :src="prebiewPath" class="previewImg">
</el-dialog>
  </div>
</template>

<script>
export default {
  name: "Add",
  data() {
    return {
      activeIndex: 0,
      addForm: {
        //添加商品的表单数据对象
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics:[],//图片的数组
        goods_introduce:'',//商品详情描述
      },
      addFormRules: {
        //表单验证规则对象
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      cateList: [], //商品分类列表
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children"
      },
      manyTableData: [], //动态参数列表数据
      onlyTableData:[0],//静态属性列表
      uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',//上传图片的url地址必须是完整路径
      headerObj:{//图片上传组件的headers请求头对象
        Authorization:window.sessionStorage.getItem('token')
      },
      prebiewPath:'',//预览图片的地址
      previewVisible:false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      //获取分类列表数据
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data;
    },
    handleChange() {
      //级联选择器变化会触发这个函数
      console.log("handleChange: ", this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      //beforeTabLeave这个函数是切换标签之前的钩子函数，
      //如果在函数里面写了return false这句话,那么标签就不能切换，只能执行到return false之前的语句
      // activeName:即将切换到的那个tab项的name属性的值，
      // oldActiveName：从哪个tab切换来得name属性的值
      if (oldActiveName == "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类");
        return false;
      }
    },
    async tabClicked() {
      //切换tab标签项
      if (this.activeIndex == "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length == "0" ? [] : item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
      }else if(this.activeIndex == "2"){
          const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "only"
            }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.onlyTableData = res.data
        
      }
    },
    handlePreview(file){//处理图片预览效果
      this.prebiewPath = file.response.data.url
      this.previewVisible = true
    },
    handleRemove(file){//处理移除图片的操作
      // file：将要移除的那张图片的信息
      // 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x =>x.pic==filePath)
      // 3.用数组的splice方法把图片信息对象从pics中移除
      this.addForm.pics.splice(i,1)
      console.log('this.addForm: ', this.addForm);
    },
    handleSuccess(response, file, fileList){//监听图片上传成功的事件
      // response:服务器返回的数据
      // file:文件的信息
      // fileList:当前上传组件的文件列表
      const picinfo = {
        pic:response.data.tmp_path
      }
      this.addForm.pics.push(picinfo)
    },
    add(){
      console.log(this.addForm)
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style scoped>
.el-checkbox{
  margin: 0 10px 0 0!important;
}
.previewImg{
  width:100%
}
.btnAdd{
  margin-top: 15px;
}
</style>
