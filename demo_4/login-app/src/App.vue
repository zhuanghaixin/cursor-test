<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'SF Pro Display', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
}

a {
  text-decoration: none;
  color: inherit;
}

button, input, textarea {
  font-family: inherit;
}
</style>
