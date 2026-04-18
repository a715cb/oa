import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import notification from "ant-design-vue/es/notification";
import { getAccessToken, getRefreshToken } from "@/utils/auth";
import { useUserStore } from "@/store/modules/user";
import router from "@/router";
import { AUTH_WHITE_LIST, HTTP_ERROR_DESCRIPTIONS, NOTIFICATION_DURATION } from "@/config/app";

// 创建 axios 实例
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000 // 请求超时时间 60s
});

const responseNotice = (title: string, description?: string, duration = 2) => {
  notification.error({
    message: title,
    description: description,
    duration: duration
  });
};

const errorHandler = (error: Recordable) => {
  const store = useUserStore();
  notification.destroy();

  // 处理 CORS 错误、网络错误等 error.response 为 undefined 的情况
  if (!error.response) {
    const isCorsError = error.message && error.message.includes('Access-Control-Allow-Origin');
    const isNetworkError = error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message === 'Network Error';

    if (isCorsError) {
      responseNotice('跨域请求被阻止', '请检查服务器 CORS 配置', NOTIFICATION_DURATION.networkError);
    } else if (isNetworkError) {
      responseNotice('网络连接失败', '请检查网络连接或后端服务是否正常运行', NOTIFICATION_DURATION.networkError);
    } else {
      responseNotice('请求失败', '系统繁忙，请稍后重试', NOTIFICATION_DURATION.error);
    }
    return Promise.reject(error);
  }

  const { status, data } = error.response;
  const message = data?.msg || data?.message || '请求失败';
  if (status === 401) {
    const currentRoute = router.currentRoute.value;
    if (!AUTH_WHITE_LIST.includes(currentRoute.path)) {
      responseNotice(message);
    }
    store.logout(false);
    return Promise.reject(error.response);
  } else {
    const safeMessage = HTTP_ERROR_DESCRIPTIONS[status] || message;
    responseNotice(safeMessage, undefined, NOTIFICATION_DURATION.error);
  }
  return Promise.reject(error);
};

// request 拦截器
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", token);
  }
  return config;
}, errorHandler);

// response 拦截器
http.interceptors.response.use(response => {
  if (response.config.responseType === "blob") {
    return response;
  }

  // 登录过期 刷新 token 重新请求
  if (response.data.code === 401) {
    return refreshToken(response);
  }

  return response.data;
}, errorHandler);

// 令牌是否正在刷新
let refreshing = false;
// 请求队列
let requests: Array<Fn> = [];

//令牌刷新
const refreshToken = (response: Recordable) => {
  const config = response.config;
  const store = useUserStore();
  const refreshToken = getRefreshToken();
  if (!refreshing && refreshToken) {
    refreshing = true;
    return http({
      url: "refreshToken",
      method: "get",
      headers: {
        Authorization: refreshToken
      }
    })
      .then(({ data }) => {
        store.setToken(data);
        config.headers["Authorization"] = getAccessToken();
        // 请求出队列
        requests.forEach((cb: Fn) => cb());
        requests = [];
        return http(config);
      })
      .catch((err) => {
        requests = [];
        store.logout(false);
        return Promise.reject(err);
      })
      .finally(() => {
        if (requests.length > 0) {
          requests.forEach((cb: Fn) => cb());
          requests = [];
        }
        refreshing = false;
      });
  } else {
    return new Promise(resolve => {
      // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
      requests.push(() => {
        config.headers["Authorization"] = getAccessToken();
        resolve(http(config));
      });
    });
  }
};

export default http;
