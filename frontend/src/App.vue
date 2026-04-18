<template>
  <a-config-provider :locale="zhCN" :theme="themeSetting">
    <token-provider>
      <router-view />
    </token-provider>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from "ant-design-vue/es/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { onUnmounted } from "vue";
import { useAppStore, setRealDarkTheme } from "@/store/modules/app";
import { storeToRefs } from "pinia";
import { usePreferredColorSchemeCallback } from "@/composables/usePreferredColorScheme";

const appStore = useAppStore();
setRealDarkTheme(appStore.theme);
const { themeSetting } = storeToRefs(appStore);

// 监听系统主题变化 - 使用可清理的 hook 模式
const cleanupThemeListener = usePreferredColorSchemeCallback((isDark: boolean) => {
  appStore.setTheme(isDark ? "realDark" : "light");
});

// 组件卸载时清理事件监听器，防止内存泄漏
onUnmounted(() => {
  cleanupThemeListener();
});
</script>
