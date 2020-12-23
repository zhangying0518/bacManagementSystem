<template>
  <div>
      <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
        <div style="width:750px;height:500px" id="main"></div>
    </el-card>
  </div>
</template>

<script>
var echarts = require("echarts");
import _ from "lodash";
export default {
  name: "Report",
  data() {
    return {
      options: {
        title: {
          text: "用户来源"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#E9EEF3"
            }
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ]
      }
    };
  },
  async mounted() {
    //必须在这个函数初始化图表，这个函数表示页面dom元素被渲染完毕了
    //3.基于准备好的dom，初始化echarts
    var myChart = echarts.init(document.getElementById("main"));
    // 4.准备数据和配置项
    const { data: res } = await this.$http.get("reports/type/1");
    if (res.meta.status !== 200) {
      return this.$message.error(res.meta.msg);
    }
    // 用_merge方法把服务器返回的数据和data中的options做一下合并，如果不合并的话图表会确一些鼠标跟随的效果
    // data中的options数据是从接口文档拷贝的，接口文档给的
    const result = _.merge(res.data, this.options);
    // 5.展示数据
    myChart.setOption(result);
  }
};
</script>

<style scoped>
</style>
