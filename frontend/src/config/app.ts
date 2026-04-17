/**
 * 项目默认配置项
 */

export default {
  appName: "在线OA", //应用名称
  version: "1.0.0", //版本号
  primaryColor: "#4073fa", // 主色系
  theme: "light", // 菜单主题 dark | light | real-dark
  layout: "side", // 布局模式：side | top | mix | left
  cachePrefix: "", // 缓存 key 前缀
  uploadUrl: "/upload/file", //默认上传地址
  showBreadCrumb: true, //是否显示面包屑导航栏，在 top 和 mix 模式下有效
  showMultiTabs: true, //是否显示标签页
  fixedMultiTabs: true, //固定标签页
  splitMenu: true, //是否自动分割菜单，在 mix 模式下生效
  animation: "fade-slide", //路由动画
  openAnimation: false, //是否开启路由动画
  openNProgress: true, //是否开启页面页面进度条
  showFooter: true, //是否显示底栏
  tabsType: "smart-tab", //多标签的类型 smart-tab | smooth-tab
  setPosition: "header", //主题设置位置 header | fixed
  borderRadius: 2, //圆角
  copyright: {
    company: 'OnLine OA Team',
    link: 'http://localhost:5173',
    icp: '粤ICP备2026000000号'
  }
};
