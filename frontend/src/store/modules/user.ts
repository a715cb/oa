import * as loginApi from "@/api/login";
import * as auth from "@/utils/auth";
import router from "@/router";
import { defineStore } from "pinia";

interface UserState {
  accessToken: string;
  refreshToken: string;
  roles: Array<string>;
  userInfo: {
    id?: string | number;
    avatar?: string;
    realname?: string;
    username?: string;
    role_name?: string;
    department_name?: string;
  };
  rules: Array<string>;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface UserInfoResponse {
  id?: string | number;
  avatar?: string;
  realname?: string;
  username?: string;
  role_name?: string;
  department_name?: string;
  roles: Array<string>;
  rules: Array<string>;
}

interface LoginResponse {
  data?: Tokens;
  code: number;
  msg: string;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    accessToken: auth.getAccessToken(),
    refreshToken: auth.getRefreshToken(),
    roles: [],
    userInfo: {},
    rules: []
  }),
  actions: {
    async login(userInfo: Record<string, any>): Promise<LoginResponse> {
      try {
        const response = await loginApi.login(userInfo);
        const { data } = response;
        if (data) {
          this.setToken(data);
        }
        return response;
      } catch (error) {
        throw error;
      }
    },

    async logout(callApi = true): Promise<void> {
      try {
        if (callApi) {
          await loginApi.logout();
        }
      } finally {
        this.clearState();
        auth.clearAuth();
        router.push("/login");
      }
    },

    clearState(): void {
      this.roles = [];
      this.rules = [];
      this.userInfo = {};
      this.accessToken = "";
      this.refreshToken = "";
    },

    setToken(data: Tokens): void {
      const { access_token, refresh_token } = data;
      if (access_token) {
        auth.setAccessToken(access_token);
        this.accessToken = access_token;
      }
      if (refresh_token) {
        auth.setRefreshToken(refresh_token);
        this.refreshToken = refresh_token;
      }
    },

    async getUserInfo(): Promise<UserInfoResponse> {
      try {
        const res = await loginApi.getUserInfo();
        const result = res.data as UserInfoResponse;
        if (res.code === 1) {
          this.roles = result.roles;
          this.rules = result.rules;
          this.userInfo = result;
        } else {
          throw new Error("getUserInfo: 获取用户信息失败！");
        }
        return result;
      } catch (error) {
        throw error;
      }
    }
  }
});
