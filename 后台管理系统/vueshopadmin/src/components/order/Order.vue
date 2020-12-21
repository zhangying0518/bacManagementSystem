<template>
  <div>
      <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
       <el-row>
           <el-col :span="8">
             <el-input placeholder="请输入内容">
               <el-button slot="append" icon="el-icon-search"></el-button>
             </el-input>
           </el-col>
       </el-row>
       <!-- 订单列表数据 -->
       <el-table :data="orderList" border stripe>
         <el-table-column type="index"></el-table-column>
         <el-table-column label="订单编号" prop="order_number"></el-table-column>
         <el-table-column label="订单价格" prop="order_price"></el-table-column>
         <el-table-column label="是否付款" prop="order_pay">
           <template slot-scope="scoped">
             <el-tag type="success" v-if="scoped.row.order_pay=='1'">已付款</el-tag>
             <el-tag type="danger" v-else>未付款</el-tag>
           </template>
         </el-table-column>
         <el-table-column label="是否发货">
           <template slot-scope="scoped">
             {{scoped.row.is_send}}
           </template>
         </el-table-column>
         <el-table-column label="下单时间">
           <template slot-scope="scoped">
             {{scoped.row.create_time | dateFormat}}
           </template>
         </el-table-column>
         <el-table-column label="操作">
           <template>
             <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
             <el-button size="mini" type="success" icon="el-icon-location"></el-button>
           </template>
         </el-table-column>
       </el-table>
        <!-- <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10,15, 20]"
        :page-size="queryInfo.pagesize"
        layout="sizes, prev, pager, next, jumper"
        :total="total" background>
        </el-pagination>  -->
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Order",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      total: 0, //总数据条数
      orderList: [] //数据列表
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
     handleSizeChange(newSize) {//分页的每页条数改变
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    handleCurrentChange(newPage) {//分页的页码改变
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.total = res.data.total;
      this.orderList = res.data.goods;
    }
  }
};
</script>

<style scoped>
</style>
