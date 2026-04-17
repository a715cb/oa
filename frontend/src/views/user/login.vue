<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-bg-decoration">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <!-- 登录主体区域 -->
    <div class="login-wrapper">
      <!-- 左侧品牌展示 -->
      <div class="login-brand">
        <div class="brand-content">
          <div class="brand-logo">
            <img src="@/assets/logo.svg" alt="logo" />
          </div>
          <h1 class="brand-title">{{ title }}</h1>
          <p class="brand-slogan">高效协同 · 智能管理 · 安全可靠</p>
          <div class="brand-features">
            <div class="feature-item">
              <CheckCircleFilled class="feature-icon" />
              <span>流程自动化管理</span>
            </div>
            <div class="feature-item">
              <CheckCircleFilled class="feature-icon" />
              <span>数据实时同步</span>
            </div>
            <div class="feature-item">
              <CheckCircleFilled class="feature-icon" />
              <span>多维度统计分析</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-wrapper">
        <div class="login-form-box">
          <div class="form-header">
            <h2 class="form-title">欢迎登录</h2>
            <p class="form-subtitle">请使用您的账号密码登录系统</p>
          </div>

          <a-form
            ref="formRef"
            :model="state.form"
            class="login-form"
            :rules="state.rules"
            @finish="submitForm"
          >
            <a-form-item name="username">
              <div class="input-label">用户名</div>
              <a-input
                size="large"
                allowClear
                v-model:value="state.form.username"
                placeholder="请输入用户名"
                class="custom-input"
              >
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item name="password">
              <div class="input-label">密码</div>
              <a-input-password
                size="large"
                v-model:value="state.form.password"
                placeholder="请输入密码"
                class="custom-input"
              >
                <template #prefix>
                  <LockOutlined class="input-icon" />
                </template>
              </a-input-password>
            </a-form-item>

            <div class="form-options">
              <a-checkbox v-model:checked="state.remAccount" class="remember-checkbox">
                记住账号
              </a-checkbox>
              <a class="forgot-link">忘记密码？</a>
            </div>

            <a-form-item>
              <a-button
                :loading="state.loading"
                type="primary"
                size="large"
                htmlType="submit"
                class="login-btn"
                block
              >
                登 录
              </a-button>
            </a-form-item>
          </a-form>

          <!-- 版权信息 -->
          <div class="copyright">
            <p>Copyright © {{ copyright.year }} {{ copyright.company }}</p>
            <p class="copyright-sub">{{ copyright.icp }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, CheckCircleFilled } from '@ant-design/icons-vue'
import { useUserStore } from '@/store/modules/user'
import config from '@/config'
import storage from '@/utils/storage'
import { message } from 'ant-design-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const title = computed(() => config.appName)
const copyright = computed(() => ({
  year: new Date().getFullYear(),
  company: config.copyright?.company || '春泰财务',
  icp: config.copyright?.icp || ''
}))

const state = reactive({
  form: {
    username: '',
    password: ''
  },
  rules: {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' } as any],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' } as any]
  },
  remAccount: false,
  loading: false
})

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value?.validate()
    state.loading = true

    const res = await userStore.login(state.form)

    if (res.code === 1) {
      // 保存账号记忆
      storage.set('account', {
        remember: state.remAccount,
        username: state.remAccount ? state.form.username : ''
      })
      message.success('登录成功')
      router.push({ path: '/' })
    } else {
      message.error(res.msg || '登录失败')
    }
  } catch {
    message.error('登录失败，请稍后重试')
  } finally {
    state.loading = false
  }
}

onMounted(() => {
  const data = storage.get('account')
  if (data?.remember) {
    state.remAccount = data.remember
    state.form.username = data.username || ''
  }
})
</script>

<style scoped lang="less">
// 变量定义
@primary-color: #1890ff;
@primary-gradient: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
@bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
@text-primary: #262626;
@text-secondary: #8c8c8c;
@border-radius: 8px;

.login-container {
  min-height: 100vh;
  width: 100%;
  background: @bg-gradient;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 背景装饰
.login-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;

    &.circle-1 {
      width: 600px;
      height: 600px;
      background: @primary-gradient;
      top: -200px;
      right: -100px;
    }

    &.circle-2 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #36cfc9 0%, #1890ff 100%);
      bottom: -100px;
      left: -100px;
    }

    &.circle-3 {
      width: 300px;
      height: 300px;
      background: @primary-gradient;
      top: 50%;
      left: 30%;
      opacity: 0.05;
    }
  }
}

// 登录主体
.login-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  margin: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

// 左侧品牌区
.login-brand {
  flex: 1;
  background: @primary-gradient;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #fff;

  .brand-content {
    text-align: center;
  }

  .brand-logo {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);

    img {
      width: 50px;
      height: 50px;
      filter: brightness(0) invert(1);
    }
  }

  .brand-title {
    font-size: 32px;
    font-weight: 600;
    margin-bottom: 12px;
    letter-spacing: 2px;
  }

  .brand-slogan {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 48px;
    letter-spacing: 1px;
  }

  .brand-features {
    text-align: left;
    display: inline-flex;
    flex-direction: column;
    gap: 16px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;

      .feature-icon {
        font-size: 18px;
        color: #52c41a;
      }
    }
  }
}

// 右侧表单区
.login-form-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  background: #fff;

  .login-form-box {
    width: 100%;
    max-width: 360px;
  }

  .form-header {
    text-align: center;
    margin-bottom: 40px;

    .form-title {
      font-size: 28px;
      font-weight: 600;
      color: @text-primary;
      margin-bottom: 8px;
    }

    .form-subtitle {
      font-size: 14px;
      color: @text-secondary;
    }
  }
}

// 表单样式
.login-form {
  .input-label {
    font-size: 14px;
    color: @text-primary;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .custom-input {
    :deep(.ant-input-affix-wrapper) {
      padding: 0 12px;
      border-radius: @border-radius;
      border: 1px solid #d9d9d9;
      transition: all 0.3s;

      &:hover,
      &:focus,
      &-focused {
        border-color: @primary-color;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
      }

      .ant-input {
        height: 44px;
        padding-left: 8px;
      }

      .ant-input-prefix {
        margin-right: 8px;
      }
    }

    .input-icon {
      font-size: 16px;
      color: @text-secondary;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .remember-checkbox {
      :deep(.ant-checkbox-inner) {
        border-radius: 4px;
      }
    }

    .forgot-link {
      font-size: 14px;
      color: @primary-color;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: darken(@primary-color, 10%);
      }
    }
  }

  .login-btn {
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    border-radius: @border-radius;
    background: @primary-gradient;
    border: none;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

// 版权信息
.copyright {
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  p {
    font-size: 12px;
    color: @text-secondary;
    margin: 0;

    &.copyright-sub {
      margin-top: 4px;
    }
  }
}

// 响应式设计
@media (max-width: 992px) {
  .login-wrapper {
    flex-direction: column;
    margin: 20px;
    min-height: auto;
  }

  .login-brand {
    padding: 40px 30px;

    .brand-logo {
      width: 60px;
      height: 60px;

      img {
        width: 36px;
        height: 36px;
      }
    }

    .brand-title {
      font-size: 24px;
    }

    .brand-slogan {
      margin-bottom: 24px;
    }

    .brand-features {
      display: none;
    }
  }

  .login-form-wrapper {
    padding: 40px 30px;
  }
}

@media (max-width: 576px) {
  .login-wrapper {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }

  .login-brand {
    padding: 30px 20px;
  }

  .login-form-wrapper {
    padding: 30px 20px;
  }
}
</style>
