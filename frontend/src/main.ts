import { createApp } from "vue";
import App from "./App.vue";
import { setupStore } from "@/store";
import router from "@/router";
import { setupRouterGuard } from "@/router/permission";
import setupComponent from "@/components";
import { setupGlobDirectives } from "@/directives";
import "@/styles/global.less";
import "ant-design-vue/dist/reset.css";

import "highlight.js/styles/github.css";
import "highlight.js/lib/common";
import hljsVuePlugin from "@highlightjs/vue-plugin";

// 初始化 SVG 图标
import { initSvgSprites } from "@/assets/svgs";

const app = createApp(App);

app.use(router);
app.use(hljsVuePlugin);

// 初始化 SVG 图标精灵
initSvgSprites();

//注册全局指令
setupGlobDirectives(app);

//注册全局组件
setupComponent(app);

//注册路由守卫
setupRouterGuard(router);

//注册 store
setupStore(app);

app.mount("#app");
