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
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning" 
        :closable="false">
      </el-alert>
        <!-- 选择商品分类区域 -->
        <el-row class="cat_opt">
            <el-col>
                <span>选择商品分类：</span>
                <el-cascader
                v-model="selectedCateKeys"
                expand-trigger="hover"
                :options="catelist"
                :props="cateProps"
                @change="handleChange">
             </el-cascader>
            </el-col>
        </el-row>
        <!-- tab页区域 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" @click="addDialogVisible=true" :disabled="isBtnDisabled" size="mini">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                    <el-table-column width="100px" label="展开" type='expand'>
                      <template slot-scope="scope">
                        <el-tag @close="handleClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" closable :key="i">{{item}}</el-tag>
                        <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column type='index' label="#"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                             <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary"  @click="addDialogVisible=true" :disabled="isBtnDisabled" size="mini">添加属性</el-button>
                <!-- 静态属性表格 -->
                <el-table :data="onlyTableData" border stripe>
                     <el-table-column width="100px" label="展开" type='expand'>
                      <template slot-scope="scope">
                        <el-tag @close="handleClose(i,scope.row)" v-for="(item,i) in scope.row.attr_vals" closable :key="i">{{item}}</el-tag>
                        <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                      >
                      </el-input>
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                      </template>
                    </el-table-column>
                    <el-table-column type='index' label="#"></el-table-column>
                    <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                             <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
           
        </el-tabs>
  </el-card>
  <!-- 添加参数的对话框 -->
  <el-dialog
    :title="'添加' + titleText"
    :visible.sync="addDialogVisible"
    width="50%"
   @close="addDialogClosed">
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
    </span>
    </el-dialog>

     <!-- 修改参数的对话框 -->
  <el-dialog
    :title="'修改' + titleText"
    :visible.sync="editDialogVisible"
    width="50%"
   @close="editDialogClosed">
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      catelist: [], //商品分类列表
      selectedCateKeys: [], //级联选择器双向绑定的数组
      cateProps: {
        //级联选择器的配置对象
        value: "cat_id", //选中的值
        label: "cat_name",
        children: "children"
      },
      activeName: "many", //默认显示的标签名称，为name的属性值
      onlyTableData: [], //静态属性数据
      manyTableData: [], //动态参数数据
      addDialogVisible: false, //控制添加参数对话框的显示与隐藏
      addForm: {
        //添加参数的表单数据对象
        attr_name: ""
      },
      addFormRules: {
        //添加表单的验证规则对象
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      },
      editDialogVisible: false, //控制修改对话框的显示与隐藏
      editForm: {
        //修改表单的对象
      },
      editFormRules: {
        //修改表单的验证规则对象
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      //获取所有商品分类列表
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.catelist = res.data;
    },
    handleChange() {
      //级联选择框选中项变化会触发这个函数
      this.getParamsData();
    },
    handleTabClick() {
      this.getParamsData();
    },
    async getParamsData() {
      //获取参数的数据列表
      if (this.selectedCateKeys.length !== 3) {
        //证明选中的不是三级分类
        this.selectedCateKeys = [];
        this.onlyTableData = [];
        this.manyTableData = [];
        return;
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        item.inputVisible = false;
        item.inputValue = "";
      });
      if (this.activeName === "many") {
        this.manyTableData = res.data;
      } else {
        this.onlyTableData = res.data;
      }
    },
    addDialogClosed() {
      //监听添加对话框的关闭事件
      this.$refs.addFormRef.resetFields();
    },
    addParams() {
      //点击按钮添加参数
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        this.getParamsData();
      });
    },
    async showEditDialog(attr_id) {
      //点击按钮显示修改对话框
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    editDialogClosed() {
      //重置修改表单
      this.$refs.editFormRef.resetFields();
    },
    editParams() {
      //点击按钮修改参数信息
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success("修改参数成功");
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
    async removeParams(attr_id) {
      //根据id删除对应的参数项
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success("删除参数成功");
      this.getParamsData();
    },
    async handleInputConfirm(row) {
      //文本框失去了焦点或者按下enter键都会触发
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      this.saveAttrVals(row);
    },
    showInput(row) {
      //点击按钮展示文本输入框
      row.inputVisible = true;
      this.$nextTick(_ => {
        //$nextTick函数是当页面上元素被重新渲染后，才会执行回调中的代码，
        //为什么说重新渲染,因为inputVisible一开始是false,被置为ture就要展示为true的元素，所以是重新渲染，
        this.$refs.saveTagInput.$refs.input.focus(); //让文本框自动获取焦点
      });
    },
    async saveAttrVals(row) {
      //将attr_vals的操作保存到数据库
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success("修改参数成功");
    },
    handleClose(i, row) {
      //删除对应参数的可选项
      row.attr_vals.splice(i, 1);
      this.saveAttrVals(row);
    }
  },
  computed: {
    isBtnDisabled() {
      //如果按你需要被禁用，则返回true,否则返回false
      if (this.selectedCateKeys.length !== 3) {
        return true;
      }
      return false;
    },
    cateId() {
      //当前选中的三级分类的id
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      }
      return null;
    },
    // 动态计算标题的文本
    titleText() {
      if (this.activeName == "many") {
        //动态参数
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
