import { Layout, Iframe, RouteView } from "@/layout";
import { getRouter } from "@/api/login";
import { httpReg, generateRandomStr } from "@/utils";
import { type RouteRecord, type RouterMenu, MenuEnum } from "./types";
import { cloneDeep } from "lodash-es";

const modules = import.meta.glob("../views/**/**.vue");

const routerComponents: Recordable = {
  Layout,
  Iframe,
  RouteView
};

/**
 * 生成根级路由
 *
 * @return RouterMenu
 */
const generateRootRouter = (title: string, icon = "home-outlined") => {
  const rootRouter: RouterMenu = {
    path: "/",
    component: "Layout",
    redirect: "/home",
    title: title,
    icon: icon,
    hide_children: true,
    children: [
      {
        path: "home",
        component: "home/index",
        title: title,
        icon: icon,
        breadcrumb: false
      }
    ]
  };
  return rootRouter;
};

/**
 * SEC-019: 验证路由配置结构，防止后端响应被篡改添加恶意路由
 * 
 * @param route 待验证的路由对象
 * @return boolean 验证是否通过
 */
const validateRoute = (route: any): boolean => {
  // 必须有 path 和 component 字段
  if (!route.path || typeof route.path !== 'string') {
    return false;
  }

  // path 不能包含危险字符
  if (/[\x00-\x1f<>"'&]/.test(route.path)) {
    return false;
  }

  // path 长度限制
  if (route.path.length > 200) {
    return false;
  }

  // component 必须是字符串且不能包含危险字符
  if (route.component && typeof route.component === 'string') {
    if (/[\x00-\x1f<>"'&;]/.test(route.component)) {
      return false;
    }
  }

  // meta 字段验证
  if (route.meta) {
    if (route.meta.title && typeof route.meta.title === 'string' && route.meta.title.length > 100) {
      return false;
    }
  }

  return true;
};

/**
 * 获取路由菜单信息,生成路由
 *
 * @returns {Promise<RouteRecord[]>}
 */
export const generatorDynamicRouter: () => Promise<RouteRecord[]> = () => {
  return new Promise((resolve, reject) => {
    getRouter()
      .then(({ data }: { data: RouterMenu[] }) => {
        // SEC-019: 验证返回的路由数据结构
        if (!Array.isArray(data)) {
          reject(new Error('路由数据格式错误'));
          return;
        }

        // SEC-019: 逐个验证路由项
        for (const route of data) {
          if (!validateRoute(route)) {
            reject(new Error('路由配置验证失败'));
            return;
          }
        }

        const homeRouter = generateRootRouter("首页");
        data.unshift(homeRouter);
        const routers = generator(data);
        resolve(routers);
      })
      .catch(err => {
        reject(err);
      });
  });
};

/**
 * 不存在父子级,生成菜单项
 *
 * @return void
 */
const generateMenuItem = (router: RouteRecord) => {
  const childrenRouter = cloneDeep(router);
  const routerPath = router.path + generateRandomStr(4);
  router.hideChildrenInMenu = true;
  router.meta.hidden = true;
  router.meta.breadcrumb = false;
  router.component = Layout;
  router.children = [childrenRouter];
  router.path = routerPath;
  router.name = routerPath;
  router.redirect = childrenRouter.path;
};

/**
 * 格式化 后端 结构信息并递归生成层级路由表
 *
 * @param routerMap
 * @param parent
 * @param lastNamePath
 * @return RouteRecord
 */
const generator = (
  routerMap: RouterMenu[],
  parent?: RouteRecord,
  lastNamePath: string[] = []
): RouteRecord[] => {
  return routerMap.map((item: RouterMenu) => {
    const isExternalLink = httpReg(item.path);
    const routerPath = isExternalLink ? `/${item.path}` : `${(parent && parent.path) || ""}/${item.path}`;
    const currentRouter: RouteRecord = {
      // 路由地址
      path: routerPath,
      //路由名称
      name: Symbol(routerPath),
      // 路由对应的组件
      component: routerComponents[item.component] || modules[`../views/${item.component}.vue`],
      // 隐藏菜单
      hidden: !!item.hidden,
      // 路由元数据
      meta: {
        title: item.title,
        icon: item.icon,
        active_key: item.active_key,
        type: item.type,
        url: item.link_url,
        breadcrumb: item?.breadcrumb
      }
    };

    //没有对应组件
    if (!isExternalLink && currentRouter.component === undefined) {
      currentRouter.component = () => import("@/views/exception/not-found.vue");
    }

    //多级菜单
    if (item.type == MenuEnum.CATALOGUE && item.children) {
      if (parent && parent.meta.type == MenuEnum.CATALOGUE) {
        currentRouter.component = RouteView;
      }
    }

    // 把有子菜单的并且父菜单是要隐藏的，都给子菜单增加一个 hidden 属性
    if (parent && parent.hideChildrenInMenu) {
      currentRouter.meta.hidden = true;
    }

    //隐藏子菜单
    currentRouter.hideChildrenInMenu = !!item.hide_children;

    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!isExternalLink) {
      currentRouter.path = currentRouter.path.replace("//", "/");
    }

    currentRouter.meta.namePath = lastNamePath.concat(currentRouter.path);

    //不存在父子级，作为菜单项
    if (!parent && !item.children && !isExternalLink) {
      generateMenuItem(currentRouter);
    }

    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      const firstVisibleChild = item.children.find(child => !child.hidden && !httpReg(child.path));
      currentRouter.redirect = item.redirect || (firstVisibleChild ? `${currentRouter.path}/${firstVisibleChild.path}` : undefined);
      currentRouter.children = generator(
        item.children,
        currentRouter,
        lastNamePath.concat(currentRouter.path)
      );
    }
    return currentRouter;
  });
};
