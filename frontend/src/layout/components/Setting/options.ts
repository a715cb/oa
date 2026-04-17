import type { AppState } from "@/store/modules/app";
import themeLightSvg from '@/assets/svgs/theme-light.svg?raw';
import themeDarkSvg from '@/assets/svgs/theme-dark.svg?raw';
import themeRealDarkSvg from '@/assets/svgs/theme-real-dark.svg?raw';

export const themeStyle = [
  {
    label: "亮色主题风格",
    icon: "svg:theme-light",
    svg: themeLightSvg,
    value: "light" as AppState['theme']
  },
  {
    label: "暗色主题风格",
    icon: "svg:theme-dark",
    svg: themeDarkSvg,
    value: "dark" as AppState['theme']
  },
  {
    label: "暗黑模式",
    icon: "svg:theme-real-dark",
    svg: themeRealDarkSvg,
    value: "realDark" as AppState['theme']
  }
];

/** 主题色 */
export const themeColors = [
  {
    key: "极客蓝（默认）",
    color: "#4073fa"
  },
  {
    key: "拂晓蓝",
    color: "#1677ff"
  },
  {
    key: "薄暮",
    color: "#f5222d"
  },
  {
    key: "火山",
    color: "#fa541c"
  },
  {
    key: "日暮",
    color: "#ff9900"
  },
  {
    key: "苍岭绿",
    color: "#27b59c"
  },
  {
    key: "海湾蓝",
    color: "#536DFE"
  },
  {
    key: "黛紫",
    color: "#955ce6"
  }
];

/** 导航模式（布局方式） */
import layoutSideSvg from '@/assets/svgs/layout-side.svg?raw';
import layoutTopSvg from '@/assets/svgs/layout-top.svg?raw';
import layoutMixSvg from '@/assets/svgs/layout-mix.svg?raw';
import layoutLeftSvg from '@/assets/svgs/layout-left.svg?raw';

export const layouts = [
  {
    label: "侧边菜单布局",
    icon: "svg:layout-side",
    svg: layoutSideSvg,
    value: "side"
  },
  {
    label: "顶部菜单布局",
    icon: "svg:layout-top",
    svg: layoutTopSvg,
    value: "top"
  },
  {
    label: "混合布局",
    icon: "svg:layout-mix",
    svg: layoutMixSvg,
    value: "mix"
  },
  {
    label: "左侧混合布局",
    icon: "svg:layout-left",
    svg: layoutLeftSvg,
    value: "left"
  }
];

/** 路由动画 */
export const animation = [
  {
    value: "fade-slide",
    label: "滑动消退"
  },
  {
    value: "fade-bottom",
    label: "底部消退"
  },
  {
    value: "fade-top",
    label: "顶部消退"
  },
  {
    value: "fade-scale",
    label: "缩小渐变"
  },
  {
    value: "zoom-fade",
    label: "放大渐变"
  }
];

//多标签类型
export const tabsType = [
  {
    value: "smooth-tab",
    label: "圆滑"
  },
  {
    value: "smart-tab",
    label: "灵动"
  }
];

//主题设置位置
export const setPosiList = [
  {
    value: "header",
    label: "顶栏"
  },
  {
    value: "fixed",
    label: "固定"
  }
];
