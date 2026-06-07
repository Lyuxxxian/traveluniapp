<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">灵山文旅 · 管理端</div>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/dashboard">数据概览</el-menu-item>
        <el-sub-menu index="service">
          <template #title>服务运营</template>
          <el-menu-item index="/service/feedback">意见反馈</el-menu-item>
          <el-menu-item index="/service/tickets">客服工单</el-menu-item>
          <el-menu-item index="/service/reviews">点评审核</el-menu-item>
          <el-menu-item index="/service/faqs">FAQ</el-menu-item>
          <el-menu-item index="/service/questionnaires">问卷</el-menu-item>
          <el-menu-item index="/service/config">客服配置</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="content">
          <template #title>内容运营</template>
          <el-menu-item index="/content/home">首页配置</el-menu-item>
          <el-menu-item index="/content/discover">发现内容</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="map">
          <template #title>地图运营</template>
          <el-menu-item index="/map/points">点位管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/dev/content-target">组件验收 Target</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span>{{ auth.admin?.name || '管理员' }}</span>
        <el-button link type="primary" @click="logout">退出</el-button>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  min-height: 100vh;
}
.aside {
  background: #1f2d3d;
  color: #fff;
}
.logo {
  padding: 20px 16px;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
}
.header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  border-bottom: 1px solid #eee;
}
.main {
  background: #f5f7fa;
}
</style>
