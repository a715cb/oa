<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="svgContent"
    class="svg-icon-container"
    :style="containerStyle"
    v-html="svgContent"
  ></div>
</template>
<!-- eslint-enable vue/no-v-html -->

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  svg?: string;
  size?: string | number;
  width?: string | number;
  height?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  svg: '',
  size: '48px',
  width: '48px',
  height: '48px'
});

const svgContent = computed(() => props.svg);

const containerStyle = computed(() => {
  const widthVal = props.width || (typeof props.size === 'number' ? `${props.size}px` : props.size);
  const heightVal = props.height || (typeof props.size === 'number' ? `${props.size}px` : props.size);
  
  return {
    width: widthVal,
    height: heightVal,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
});
</script>

<style scoped>
.svg-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.svg-icon-container :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
