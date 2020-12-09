<template>
  <div>
      <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
        <!-- 添加分类按钮区 -->
        <el-row>
             <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>
        <!-- 表格 -->
        <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable">
        <!-- 是否有效模板 -->
            <template slot="isOk" slot-scope="scope">
                <i style="color:lightgreen" class="el-icon-circle-check" v-if="!scope.row.cat_deleted"></i>
                <i style="color:red" class="el-icon-circle-closet" v-else></i>
            </template>
            <!-- 排序 -->
             <template slot="order" slot-scope="scope">
               <el-tag size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
               <el-tag size="mini" v-else-if="scope.row.cat_level==1" type="success">二级</el-tag>
               <el-tag size="mini" v-else type="warning">三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="opt" slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
        </tree-table>
        <!-- 分页 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%"
    @close="addCateDialogClosed">
    <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px" class="demo-ruleForm">
        <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
         <el-form-item label="父级分类">
             <el-cascader
                v-model="selectedKeys"
                expand-trigger="hover"
                :options="parentCateList"
                :props="cascaderProps"
                @change="parentCateChanged"
                clearable
                :change-on-select="false">
             </el-cascader>
         </el-form-item>
    </el-form>
    <span slot="footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      queryInfo: {
        ////获取商品分类的参数
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [], //商品分类数据
      columns: [
        //为table指定列的定义
        { label: "分类名称", prop: "cat_name" },
        { label: "是否有效", type: "template", template: "isOk" },
        { label: "排序", type: "template", template: "order" },
        { label: "操作", type: "template", template: "opt" }
      ],
      total: 0, //总数据条数
      addCateDialogVisible: false, //控制添加分类对话框的显示与隐藏
      addCateForm: {
        //添加分类表单的数据
        cat_pid: 0,
        cat_name: "",
        cat_level: 0
      },
      //   添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      parentCateList: [], //父级分类的列表
      cascaderProps: {
        //指定级联选择器的配置对象
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: false
      },
      selectedKeys: [] //选中的父级分类的id数组
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      //获取商品分类的数据
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    handleSizeChange(newSize) {
      //监听pagesize的改变
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      //监听pageNum改变
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCateDialog() {
      //点击按钮，展示添加分类的对话框
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    async getParentCateList() {
      //获取父级分类的数据
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.parentCateList = res.data;
    },
    parentCateChanged() {
      console.log(this.selectedKeys);
      //选择项发生变化触发这个函数
      if (this.selectedKeys.length > 0) {
        //如果this.selectedKeys.length>0，说明选中了父级分类，反之没有选中父级分类，则父级分类默认是0
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCate() {
      //点击按钮添加新的分类
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    addCateDialogClosed() {
      //监听添加分类对话框关闭的事件
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    }
  }
};
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
