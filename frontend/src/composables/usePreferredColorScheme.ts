import type { Ref } from 'vue';
import { ref, onBeforeUnmount, watch } from 'vue';

/**
 * 监听系统主题偏好设置变化
 * 返回一个 ref 表示是否为暗黑模式，并在组件卸载时自动清理事件监听器
 */
export function usePreferredColorScheme(): Ref<boolean> {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = ref(mediaQuery.matches);

  // 事件处理函数 - 保持引用一致以便清理
  const handleChange = (e: MediaQueryListEvent) => {
    isDark.value = e.matches;
  };

  // 添加事件监听
  mediaQuery.addEventListener('change', handleChange);

  // 组件卸载时自动清理事件监听器
  onBeforeUnmount(() => {
    mediaQuery.removeEventListener('change', handleChange);
  });

  return isDark;
}

/**
 * 监听系统主题变化并执行回调
 * 返回一个清理函数，在组件卸载时调用
 */
export function usePreferredColorSchemeCallback(
  onChange: (isDark: boolean) => void
): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // 保持函数引用一致
  const handler = (e: MediaQueryListEvent) => {
    onChange(e.matches);
  };
  
  mediaQuery.addEventListener('change', handler);

  // 返回清理函数供组件手动调用
  const cleanup = () => {
    mediaQuery.removeEventListener('change', handler);
  };

  return cleanup;
}
